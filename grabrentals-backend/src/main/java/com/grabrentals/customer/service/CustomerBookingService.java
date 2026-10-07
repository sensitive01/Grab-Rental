package com.grabrentals.customer.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.BadRequestException;
import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.customer.dto.*;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private final SecureRandom random = new SecureRandom();

    /**
     * 1. Customer initiates a booking -> enters PENDING_ALLOCATION
     */
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, User customer) {
        String ref = generateBookingReference();

        BigDecimal advance = request.getAdvancePaid() != null ? request.getAdvancePaid() : BigDecimal.ZERO;
        BigDecimal due = request.getTotalFare().subtract(advance);
        if (due.compareTo(BigDecimal.ZERO) < 0) {
            due = BigDecimal.ZERO;
        }

        String paymentStatus = request.getPaymentStatus();
        if (paymentStatus == null || paymentStatus.isBlank()) {
            paymentStatus = advance.compareTo(BigDecimal.ZERO) > 0 ? "ADVANCE_PAID" : "PENDING";
        }

        Booking booking = Booking.builder()
                .bookingReference(ref)
                .customer(customer)
                .tripType(request.getTripType())
                .pickupCity(request.getPickupCity())
                .dropCity(request.getDropCity())
                .stops(request.getStops())
                .pickupAddress(request.getPickupAddress())
                .dropAddress(request.getDropAddress())
                .pickupDateTime(request.getPickupDateTime())
                .returnDateTime(request.getReturnDateTime())
                .vehicleCategory(request.getVehicleCategory())
                .passengerCount(request.getPassengerCount() != null ? request.getPassengerCount() : 1)
                .passengerName(request.getPassengerName() != null && !request.getPassengerName().isBlank() ? request.getPassengerName() : customer.getName())
                .passengerPhone(request.getPassengerPhone() != null && !request.getPassengerPhone().isBlank() ? request.getPassengerPhone() : customer.getPhone())
                .totalFare(request.getTotalFare())
                .advancePaid(advance)
                .dueAmount(due)
                .paymentStatus(paymentStatus)
                .status(BookingStatus.PENDING_ALLOCATION)
                .specialInstructions(request.getSpecialInstructions())
                .build();

        Booking saved = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("BOOKING")
                    .event("BOOKING_CREATED")
                    .userId(customer.getId().toString())
                    .userName(customer.getName())
                    .userRole(customer.getRole().name())
                    .module("CUSTOMER_BOOKINGS")
                    .targetEntity("Booking: " + ref)
                    .details("New booking created by customer. Ref: " + ref)
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    /**
     * 2. Operations appoints Car and Driver -> status becomes ASSIGNED_TO_VENDOR
     */
    @Transactional
    public BookingResponse assignVehicleAndDriver(String idOrRef, BookingAssignRequest request, User operationsUser) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        if (booking.getStatus() != BookingStatus.PENDING_ALLOCATION && booking.getStatus() != BookingStatus.REASSIGN_REQUIRED) {
            throw new BadRequestException("Booking is not in an assignable state (current: " + booking.getStatus() + ")");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));

        // The vendor is the owner of the vehicle (or explicit vendor if provided)
        User vendor = vehicle.getUser();
        if (request.getVendorId() != null) {
            vendor = userRepository.findById(request.getVendorId())
                    .orElse(vehicle.getUser());
        }

        booking.setAssignedVehicle(vehicle);
        booking.setAssignedDriver(driver);
        booking.setVendor(vendor);
        booking.setStatus(BookingStatus.ASSIGNED_TO_VENDOR);
        booking.setVendorDeclineReason(null); // Clear previous decline reasons

        Booking updated = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("DISPATCH")
                    .event("BOOKING_ASSIGNED")
                    .userId(operationsUser.getId().toString())
                    .userName(operationsUser.getName())
                    .userRole(operationsUser.getRole().name())
                    .module("OPERATIONS_DISPATCH")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Vehicle " + vehicle.getVehicleNumber() + " & Driver " + driver.getName() + " assigned to booking " + booking.getBookingReference() + " for vendor " + vendor.getName())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(updated);
    }

    /**
     * 3. Vendor ACCEPTS the booking -> transitions to CONFIRMED and generates ride OTP
     */
    @Transactional
    public BookingResponse vendorAcceptBooking(UUID bookingId, User vendorUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateVendorOwnership(booking, vendorUser);

        if (vendorUser.getStatus() != com.grabrentals.user.entity.UserStatus.ACTIVE) {
            throw new BadRequestException("Your vendor account is pending administrator approval. Bookings cannot be accepted until approved.");
        }

        if (booking.getStatus() != BookingStatus.ASSIGNED_TO_VENDOR) {
            throw new BadRequestException("Booking cannot be accepted; current status is: " + booking.getStatus());
        }

        // Generate 4-digit ride OTP
        String rideOtp = String.format("%04d", random.nextInt(10000));
        booking.setRideOtp(rideOtp);
        booking.setStatus(BookingStatus.CONFIRMED);

        // Update assigned vehicle and driver status to BOOKED
        if (booking.getAssignedVehicle() != null) {
            booking.getAssignedVehicle().setStatus(VehicleStatus.BOOKED);
            vehicleRepository.save(booking.getAssignedVehicle());
        }
        if (booking.getAssignedDriver() != null) {
            booking.getAssignedDriver().setStatus(DriverStatus.BOOKED);
            driverRepository.save(booking.getAssignedDriver());
        }

        Booking confirmed = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("VENDOR")
                    .event("BOOKING_ACCEPTED_BY_VENDOR")
                    .userId(vendorUser.getId().toString())
                    .userName(vendorUser.getName())
                    .userRole(vendorUser.getRole().name())
                    .module("VENDOR_PORTAL")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Vendor " + vendorUser.getName() + " confirmed booking " + booking.getBookingReference())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(confirmed);
    }

    /**
     * 4. Vendor DECLINES the booking -> transitions to REASSIGN_REQUIRED and logs reason
     */
    @Transactional
    public BookingResponse vendorDeclineBooking(UUID bookingId, VendorDeclineRequest request, User vendorUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateVendorOwnership(booking, vendorUser);

        if (booking.getStatus() != BookingStatus.ASSIGNED_TO_VENDOR) {
            throw new BadRequestException("Booking cannot be declined; current status is: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REASSIGN_REQUIRED);
        booking.setVendorDeclineReason(request.getReason());

        Booking saved = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("VENDOR")
                    .event("BOOKING_DECLINED_BY_VENDOR")
                    .userId(vendorUser.getId().toString())
                    .userName(vendorUser.getName())
                    .userRole(vendorUser.getRole().name())
                    .module("VENDOR_PORTAL")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Vendor declined booking " + booking.getBookingReference() + ". Reason: " + request.getReason())
                    .status("WARNING")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    // Customer Queries
    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(User customer) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getCustomerBookingById(UUID bookingId, User customer) {
        return getCustomerBookingByIdOrRef(bookingId.toString(), customer);
    }

    @Transactional(readOnly = true)
    public BookingResponse getCustomerBookingByIdOrRef(String idOrRef, User customer) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("Access denied: You do not own this booking");
        }
        return BookingResponse.fromEntity(booking);
    }

    @Transactional
    public BookingResponse cancelCustomerBooking(UUID bookingId, User customer) {
        return cancelCustomerBookingByIdOrRef(bookingId.toString(), customer);
    }

    @Transactional
    public BookingResponse cancelCustomerBookingByIdOrRef(String idOrRef, User customer) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new BadRequestException("Access denied: You do not own this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.IN_TRANSIT) {
            throw new BadRequestException("Cannot cancel an in-progress or completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Free vehicle and driver if they were marked booked
        if (booking.getAssignedVehicle() != null) {
            booking.getAssignedVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getAssignedVehicle());
        }
        if (booking.getAssignedDriver() != null) {
            booking.getAssignedDriver().setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(booking.getAssignedDriver());
        }

        Booking cancelled = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("BOOKING")
                    .event("BOOKING_CANCELLED_BY_CUSTOMER")
                    .userId(customer.getId().toString())
                    .userName(customer.getName())
                    .userRole(customer.getRole().name())
                    .module("CUSTOMER_BOOKINGS")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Customer cancelled booking " + booking.getBookingReference())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(cancelled);
    }

    // Operations Queries
    @Transactional(readOnly = true)
    public List<BookingResponse> getOperationsBookings(BookingStatus status) {
        List<Booking> bookings = (status != null)
                ? bookingRepository.findByStatusOrderByCreatedAtDesc(status)
                : bookingRepository.findAllByOrderByCreatedAtDesc();

        return bookings.stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(String idOrRef) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }
        return BookingResponse.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(UUID bookingId) {
        return getBookingDetails(bookingId.toString());
    }

    // Vendor Queries
    @Transactional(readOnly = true)
    public List<BookingResponse> getVendorBookings(User vendor, BookingStatus status) {
        List<Booking> list = (status != null)
                ? bookingRepository.findByVendorIdAndStatusOrderByCreatedAtDesc(vendor.getId(), status)
                : bookingRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());

        return list.stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getVendorBookingByIdOrRef(String idOrRef, User vendor) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        validateVendorOwnership(booking, vendor);
        return BookingResponse.fromEntity(booking);
    }

    @Transactional
    public BookingResponse updateTripStatus(String idOrRef, BookingStatus newStatus, User actor) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        BookingStatus current = booking.getStatus();
        if (current == BookingStatus.COMPLETED || current == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a " + current + " booking");
        }

        booking.setStatus(newStatus);

        // If completed, release vehicle and driver
        if (newStatus == BookingStatus.COMPLETED) {
            if (booking.getAssignedVehicle() != null) {
                booking.getAssignedVehicle().setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(booking.getAssignedVehicle());
            }
            if (booking.getAssignedDriver() != null) {
                booking.getAssignedDriver().setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(booking.getAssignedDriver());
            }
        }

        Booking saved = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("OPERATIONS")
                    .event("TRIP_STATUS_UPDATED")
                    .userId(actor != null ? actor.getId().toString() : "SYSTEM")
                    .userName(actor != null ? actor.getName() : "System")
                    .userRole(actor != null && actor.getRole() != null ? actor.getRole().name() : "OPERATIONS")
                    .module("TRIP_DISPATCH")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Trip " + booking.getBookingReference() + " status updated from " + current + " to " + newStatus)
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    private void validateVendorOwnership(Booking booking, User vendor) {
        if (booking.getVendor() == null || !booking.getVendor().getId().equals(vendor.getId())) {
            throw new BadRequestException("Access denied: This booking is not assigned to your vendor account");
        }
    }

    private String generateBookingReference() {
        int year = LocalDate.now().getYear();
        String alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        StringBuilder sb = new StringBuilder("GR-" + year + "-");
        for (int i = 0; i < 5; i++) {
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
    }
}

package com.grabrentals.customer.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.BadRequestException;
import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.customer.dto.*;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.notification.service.NotificationService;
import com.grabrentals.user.entity.Role;
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
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
    private final NotificationService notificationService;
    private final com.grabrentals.tariff.service.VehicleTariffService vehicleTariffService;
    private final PublicVehicleService publicVehicleService;
    private final com.grabrentals.coupon.service.CouponService couponService;

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

        boolean isUpiPayment = (request.getPaymentMethod() != null && request.getPaymentMethod().toUpperCase().contains("UPI"))
                || (request.getPaymentProofUrl() != null && !request.getPaymentProofUrl().isBlank());

        BookingStatus initialStatus = isUpiPayment
                ? BookingStatus.PENDING_PAYMENT_VERIFICATION
                : BookingStatus.PENDING_ALLOCATION;

        String initialPaymentStatus;
        if (isUpiPayment) {
            initialPaymentStatus = "UNDER_REVIEW";
        } else if (request.getPaymentStatus() != null && !request.getPaymentStatus().isBlank()) {
            initialPaymentStatus = request.getPaymentStatus();
        } else {
            initialPaymentStatus = advance.compareTo(BigDecimal.ZERO) > 0 ? "ADVANCE_PAID" : "PENDING";
        }

        BigDecimal vendorPayout = request.getVendorPayout();
        if (vendorPayout == null && request.getTotalFare() != null) {
            vendorPayout = request.getTotalFare().multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
        }

        Booking booking = Booking.builder()
                .bookingReference(ref)
                .customer(customer)
                .tripType(request.getTripType())
                .pickupCity(request.getPickupCity())
                .dropCity(request.getDropCity())
                .stops(request.getStops())
                .pickupAddress(request.getPickupAddress())
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .pickupDoorNo(request.getPickupDoorNo())
                .pickupStreet(request.getPickupStreet())
                .pickupArea(request.getPickupArea())
                .pickupLandmark(request.getPickupLandmark())
                .pickupPincode(request.getPickupPincode())
                .dropAddress(request.getDropAddress())
                .pickupDateTime(request.getPickupDateTime())
                .returnDateTime(request.getReturnDateTime())
                .vehicleCategory(request.getVehicleCategory())
                .passengerCount(request.getPassengerCount() != null ? request.getPassengerCount() : 1)
                .passengerName(request.getPassengerName() != null && !request.getPassengerName().isBlank() ? request.getPassengerName() : customer.getName())
                .passengerPhone(request.getPassengerPhone() != null && !request.getPassengerPhone().isBlank() ? request.getPassengerPhone() : customer.getPhone())
                .totalFare(request.getTotalFare())
                .vendorPayout(vendorPayout)
                .advancePaid(advance)
                .dueAmount(due)
                .paymentStatus(initialPaymentStatus)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : (isUpiPayment ? "UPI_QR" : null))
                .paymentProofUrl(request.getPaymentProofUrl())
                .paymentUtrNumber(request.getPaymentUtrNumber())
                .couponCode(request.getCouponCode() != null && !request.getCouponCode().isBlank() ? request.getCouponCode().trim().toUpperCase() : null)
                .couponDiscount(request.getCouponDiscount())
                .isPetFriendly(Boolean.TRUE.equals(request.getIsPetFriendly()))
                .petType(request.getPetType())
                .petCount(request.getPetCount() != null ? request.getPetCount() : 1)
                .petCharge(request.getPetCharge() != null ? request.getPetCharge() : BigDecimal.ZERO)
                .vendorPetPayout(request.getVendorPetPayout() != null ? request.getVendorPetPayout() : BigDecimal.ZERO)
                .status(initialStatus)
                .specialInstructions(request.getSpecialInstructions())
                .build();

        Booking saved = bookingRepository.save(booking);

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            try {
                couponService.recordCouponUsage(
                        request.getCouponCode().trim(),
                        saved.getPassengerPhone(),
                        customer != null ? customer.getEmail() : null
                );
            } catch (Exception ex) {
                log.warn("Failed to record coupon usage for code '{}': {}", request.getCouponCode(), ex.getMessage());
            }
        }

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("BOOKING")
                    .event("BOOKING_CREATED")
                    .userId(customer.getId().toString())
                    .userName(customer.getName())
                    .userRole(customer.getRole().name())
                    .module("CUSTOMER_BOOKINGS")
                    .targetEntity("Booking: " + ref)
                    .details("New booking created by customer. Ref: " + ref + (isUpiPayment ? " with UPI payment proof." : ""))
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        try {
            String notifTitle = isUpiPayment ? "Payment Verification Needed" : "Fast Dispatch Alert";
            String notifMsg = isUpiPayment
                    ? "New booking #" + ref + " (" + (request.getPickupCity() != null ? request.getPickupCity() : "Origin") + " to " + (request.getDropCity() != null ? request.getDropCity() : "Destination") + ") submitted with UPI proof - requires payment verification."
                    : "New booking #" + ref + " (" + (request.getPickupCity() != null ? request.getPickupCity() : "Origin") + " to " + (request.getDropCity() != null ? request.getDropCity() : "Destination") + ") requires vehicle allocation.";

            notificationService.createNotification(
                    Role.OPERATIONS,
                    notifTitle,
                    notifMsg,
                    "HIGH",
                    isUpiPayment ? "PAYMENT_PROOF_SUBMITTED" : "BOOKING_CREATED",
                    ref,
                    "/operations/bookings?search=" + ref
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    /**
     * Verify customer payment proof (Admin or Operations)
     */
    @Transactional
    public BookingResponse verifyPayment(String idOrRef, PaymentVerificationRequest request, User adminOrOpsUser) {
        Booking booking = null;
        try {
            UUID id = UUID.fromString(idOrRef);
            booking = bookingRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (booking == null) {
            booking = bookingRepository.findByBookingReference(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + idOrRef));
        }

        boolean approve = "APPROVE".equalsIgnoreCase(request.getAction());

        if (approve) {
            booking.setPaymentStatus("ADVANCE_PAID");
            booking.setStatus(BookingStatus.PENDING_ALLOCATION);
            booking.setPaymentVerifiedAt(Instant.now());
            booking.setPaymentVerifiedBy(adminOrOpsUser.getName() + " (" + adminOrOpsUser.getEmail() + ")");
            booking.setPaymentRejectionReason(null);
            log.info("Payment verified and approved for booking #{} by {}", booking.getBookingReference(), adminOrOpsUser.getEmail());

            try {
                notificationService.createNotification(
                        Role.OPERATIONS,
                        "Payment Verified",
                        "Payment for booking #" + booking.getBookingReference() + " was verified and approved. Ready for vehicle allocation.",
                        "HIGH",
                        "PAYMENT_VERIFIED",
                        booking.getBookingReference(),
                        "/operations/assignments/vehicle?bookingId=" + booking.getBookingReference()
                );
            } catch (Exception ignored) {}
        } else {
            booking.setPaymentStatus("REJECTED");
            booking.setPaymentRejectionReason(request.getRejectionReason() != null ? request.getRejectionReason() : "Payment proof could not be verified.");
            booking.setPaymentVerifiedAt(Instant.now());
            booking.setPaymentVerifiedBy(adminOrOpsUser.getName() + " (" + adminOrOpsUser.getEmail() + ")");
            log.warn("Payment rejected for booking #{} by {}. Reason: {}", booking.getBookingReference(), adminOrOpsUser.getEmail(), booking.getPaymentRejectionReason());
        }

        Booking saved = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("PAYMENT")
                    .event(approve ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED")
                    .userId(adminOrOpsUser.getId().toString())
                    .userName(adminOrOpsUser.getName())
                    .userRole(adminOrOpsUser.getRole().name())
                    .module("PAYMENT_VERIFICATION")
                    .targetEntity("Booking: " + saved.getBookingReference())
                    .details((approve ? "Approved payment for " : "Rejected payment for ") + saved.getBookingReference() + (request.getRejectionReason() != null ? ". Reason: " + request.getRejectionReason() : ""))
                    .status(approve ? "SUCCESS" : "WARNING")
                    .build());
        } catch (Exception ignored) {}

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

        if (booking.getStatus() == BookingStatus.PENDING_PAYMENT_VERIFICATION) {
            throw new BadRequestException("Payment verification is pending for this booking. Please verify payment before allocating fleet.");
        }

        if (booking.getStatus() != BookingStatus.PENDING_ALLOCATION && booking.getStatus() != BookingStatus.REASSIGN_REQUIRED) {
            throw new BadRequestException("Booking is not in an assignable state (current: " + booking.getStatus() + ")");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId()).orElse(null);
        }

        // The vendor is the owner of the vehicle (or explicit vendor if provided)
        User vendor = vehicle.getUser();
        if (request.getVendorId() != null) {
            vendor = userRepository.findById(request.getVendorId())
                    .orElse(vehicle.getUser());
        }

        booking.setAssignedVehicle(vehicle);
        booking.setAssignedDriver(driver);
        booking.setVendor(vendor);
        if (request.getVendorPayout() != null) {
            booking.setVendorPayout(request.getVendorPayout());
        } else {
            BigDecimal tariffPayout = calculateVendorPayoutForBooking(booking, vehicle);
            if (tariffPayout != null && tariffPayout.compareTo(BigDecimal.ZERO) > 0) {
                booking.setVendorPayout(tariffPayout);
            } else if (booking.getVendorPayout() == null && booking.getTotalFare() != null) {
                booking.setVendorPayout(booking.getTotalFare().multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP));
            }
        }
        booking.setStatus(BookingStatus.ASSIGNED_TO_VENDOR);
        booking.setVendorDeclineReason(null); // Clear previous decline reasons

        Booking updated = bookingRepository.save(booking);

        try {
            String driverText = driver != null ? (" & Driver " + driver.getName()) : " (Chauffeur to be assigned by Fleet Owner)";
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("DISPATCH")
                    .event("BOOKING_ASSIGNED")
                    .userId(operationsUser.getId().toString())
                    .userName(operationsUser.getName())
                    .userRole(operationsUser.getRole().name())
                    .module("OPERATIONS_DISPATCH")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Vehicle " + vehicle.getVehicleNumber() + driverText + " assigned to booking " + booking.getBookingReference() + " for vendor " + (vendor != null ? vendor.getName() : "N/A"))
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        try {
            String vName = vendor != null ? vendor.getName() : "Fleet Owner";
            notificationService.createNotification(
                    Role.OPERATIONS,
                    "Dispatched to Partner",
                    "Booking #" + booking.getBookingReference() + " assigned vehicle " + vehicle.getVehicleNumber() + " (" + vehicle.getModel() + ") and routed to " + vName + " for chauffeur appointment.",
                    "INFO",
                    "VEHICLE_ASSIGNED",
                    booking.getBookingReference(),
                    "/operations/bookings/" + booking.getBookingReference()
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(updated);
    }

    /**
     * 3. Vendor ACCEPTS the booking -> transitions to CONFIRMED and generates ride OTP
     */
    @Transactional
    public BookingResponse vendorAcceptBooking(UUID bookingId, UUID driverId, User vendorUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateVendorOwnership(booking, vendorUser);

        if (vendorUser.getStatus() != com.grabrentals.user.entity.UserStatus.ACTIVE) {
            throw new BadRequestException("Your vendor account is pending administrator approval. Bookings cannot be accepted until approved.");
        }

        if (booking.getStatus() != BookingStatus.ASSIGNED_TO_VENDOR) {
            throw new BadRequestException("Booking cannot be accepted; current status is: " + booking.getStatus());
        }

        if (driverId != null) {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
            booking.setAssignedDriver(driver);
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
            String driverName = confirmed.getAssignedDriver() != null ? confirmed.getAssignedDriver().getName() : "None";
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("VENDOR")
                    .event("BOOKING_ACCEPTED_BY_VENDOR")
                    .userId(vendorUser.getId().toString())
                    .userName(vendorUser.getName())
                    .userRole(vendorUser.getRole().name())
                    .module("VENDOR_PORTAL")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Vendor " + vendorUser.getName() + " confirmed booking " + booking.getBookingReference() + " with driver " + driverName)
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event: {}", ex.getMessage());
        }

        try {
            String driverName = confirmed.getAssignedDriver() != null ? confirmed.getAssignedDriver().getName() : "Chauffeur";
            notificationService.createNotification(
                    Role.OPERATIONS,
                    "Partner Vendor Confirmed Dispatch",
                    "Vendor " + vendorUser.getName() + " confirmed booking #" + booking.getBookingReference() + " and appointed driver " + driverName + ".",
                    "MEDIUM",
                    "VENDOR_ACCEPTED",
                    booking.getBookingReference(),
                    "/operations/bookings/" + booking.getBookingReference()
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }

        return BookingResponse.fromEntityForVendor(confirmed);
    }

    @Transactional
    public BookingResponse vendorAcceptBooking(UUID bookingId, User vendorUser) {
        return vendorAcceptBooking(bookingId, null, vendorUser);
    }

    @Transactional
    public BookingResponse vendorAssignDriver(UUID bookingId, UUID driverId, User vendorUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        validateVendorOwnership(booking, vendorUser);
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
        booking.setAssignedDriver(driver);
        driver.setStatus(DriverStatus.BOOKED);
        driverRepository.save(driver);
        Booking saved = bookingRepository.save(booking);
        return BookingResponse.fromEntityForVendor(saved);
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

        try {
            notificationService.createNotification(
                    Role.OPERATIONS,
                    "Partner Vendor Declined Assignment",
                    "Vendor " + vendorUser.getName() + " declined booking #" + booking.getBookingReference() + ". Reason: " + request.getReason(),
                    "HIGH",
                    "VENDOR_DECLINED",
                    booking.getBookingReference(),
                    "/operations/assignments/vehicle?bookingId=" + booking.getBookingReference()
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }

        return BookingResponse.fromEntityForVendor(saved);
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
                .map(b -> {
                    BigDecimal tariffPayout = calculateVendorPayoutForBooking(b, b.getAssignedVehicle());
                    if (tariffPayout != null && tariffPayout.compareTo(BigDecimal.ZERO) > 0) {
                        b.setVendorPayout(tariffPayout);
                    }
                    return BookingResponse.fromEntityForVendor(b);
                })
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
        BigDecimal tariffPayout = calculateVendorPayoutForBooking(booking, booking.getAssignedVehicle());
        if (tariffPayout != null && tariffPayout.compareTo(BigDecimal.ZERO) > 0) {
            booking.setVendorPayout(tariffPayout);
        }
        return BookingResponse.fromEntityForVendor(booking);
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

        try {
            String ref = booking.getBookingReference();
            if (newStatus == BookingStatus.IN_TRANSIT || newStatus == BookingStatus.ON_THE_WAY) {
                notificationService.createNotification(
                        Role.OPERATIONS,
                        "Trip Dispatched (In Transit)",
                        "Booking #" + ref + " departed base depot and is currently in transit.",
                        "INFO",
                        "TRIP_DISPATCHED",
                        ref,
                        "/operations/trips/" + ref
                );
            } else if (newStatus == BookingStatus.COMPLETED) {
                notificationService.createNotification(
                        Role.OPERATIONS,
                        "Trip Completed",
                        "Booking #" + ref + " successfully completed journey. Vehicle & chauffeur released to available roster.",
                        "INFO",
                        "TRIP_COMPLETED",
                        ref,
                        "/operations/bookings/" + ref
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }

        return BookingResponse.fromEntity(saved);
    }

    @Transactional
    public BookingResponse vendorCompleteTrip(String idOrRef, TripClosingRequest request, User vendor) {
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

        BookingStatus current = booking.getStatus();
        if (current == BookingStatus.COMPLETED) {
            throw new BadRequestException("Trip has already been finalized and completed.");
        }
        if (current == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot finalize a cancelled booking.");
        }

        // Set Odometer & KM Metrics
        booking.setStartKm(request.getStartKm());
        booking.setEndKm(request.getEndKm());

        Double actualKm = request.getActualKm();
        if (actualKm == null && request.getStartKm() != null && request.getEndKm() != null) {
            actualKm = Math.max(0, request.getEndKm() - request.getStartKm());
        }
        booking.setActualKm(actualKm);

        Double extraKm = request.getExtraKm() != null ? Math.max(0, request.getExtraKm()) : 0.0;
        booking.setExtraKm(extraKm);

        BigDecimal extraKmRate = (request.getExtraKmRate() != null && request.getExtraKmRate().compareTo(BigDecimal.ZERO) > 0)
                ? request.getExtraKmRate()
                : (booking.getAssignedVehicle() != null && booking.getAssignedVehicle().getPerKmRate() != null
                    ? booking.getAssignedVehicle().getPerKmRate()
                    : new BigDecimal("14.00"));
        booking.setExtraKmRate(extraKmRate);

        BigDecimal extraKmCharge = extraKmRate.multiply(BigDecimal.valueOf(extraKm)).setScale(0, RoundingMode.HALF_UP);
        booking.setExtraKmCharge(extraKmCharge);

        // Additional Expenses
        BigDecimal toll = request.getTollCharges() != null ? request.getTollCharges().setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal permit = request.getPermitCharges() != null ? request.getPermitCharges().setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal parking = request.getParkingCharges() != null ? request.getParkingCharges().setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal allowance = request.getDriverAllowance() != null ? request.getDriverAllowance().setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal other = request.getOtherCharges() != null ? request.getOtherCharges().setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        booking.setTollCharges(toll);
        booking.setPermitCharges(permit);
        booking.setParkingCharges(parking);
        booking.setDriverAllowanceCharges(allowance);
        booking.setOtherCharges(other);
        booking.setOtherChargesNotes(request.getOtherChargesNotes());
        booking.setTripClosingNotes(request.getClosingNotes());

        // Recalculate Final Fare
        BigDecimal baseTripFare = booking.getTotalFare() != null ? booking.getTotalFare() : BigDecimal.ZERO;
        BigDecimal totalExtras = extraKmCharge.add(toll).add(permit).add(parking).add(allowance).add(other);

        // Compute 5% GST on the extra charges
        BigDecimal extrasGst = totalExtras.multiply(new BigDecimal("0.05")).setScale(0, RoundingMode.HALF_UP);
        // Original GST included in base
        BigDecimal originalGst = baseTripFare.multiply(new BigDecimal("0.05")).divide(new BigDecimal("1.05"), 0, RoundingMode.HALF_UP);
        BigDecimal totalFinalGst = originalGst.add(extrasGst);

        BigDecimal finalTotal = baseTripFare.add(totalExtras).add(extrasGst);
        booking.setFinalGst(totalFinalGst);
        booking.setFinalTotalFare(finalTotal);
        booking.setTotalFare(finalTotal);

        // Balance Due = Final Total - Advance Paid
        BigDecimal advance = booking.getAdvancePaid() != null ? booking.getAdvancePaid() : BigDecimal.ZERO;
        BigDecimal due = finalTotal.subtract(advance);
        booking.setDueAmount(due.compareTo(BigDecimal.ZERO) > 0 ? due : BigDecimal.ZERO);

        // Generate Invoice Number
        String invNum = "INV-" + booking.getBookingReference().replaceAll("[^A-Za-z0-9]", "");
        booking.setInvoiceNumber(invNum);
        booking.setTripCompletedAt(Instant.now());
        booking.setTripClosedBy(vendor != null ? vendor.getName() : "Vendor Partner");

        // Mark COMPLETED
        booking.setStatus(BookingStatus.COMPLETED);

        // Release vehicle and driver to AVAILABLE
        if (booking.getAssignedVehicle() != null) {
            booking.getAssignedVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getAssignedVehicle());
        }
        if (booking.getAssignedDriver() != null) {
            booking.getAssignedDriver().setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(booking.getAssignedDriver());
        }

        Booking saved = bookingRepository.save(booking);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("OPERATIONS")
                    .event("TRIP_FINALIZED_AND_COMPLETED")
                    .userId(vendor != null ? vendor.getId().toString() : "VENDOR")
                    .userName(vendor != null ? vendor.getName() : "Vendor")
                    .userRole("VENDOR")
                    .module("TRIP_CLOSING")
                    .targetEntity("Booking: " + booking.getBookingReference())
                    .details("Trip " + booking.getBookingReference() + " finalized by vendor with total fare ₹" + finalTotal + " (Extras: ₹" + totalExtras + ", GST: ₹" + totalFinalGst + ", Balance Due: ₹" + due + ")")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to log audit event for trip closing: {}", ex.getMessage());
        }

        try {
            notificationService.createNotification(
                    Role.OPERATIONS,
                    "Trip Finalized & Invoiced",
                    "Booking #" + booking.getBookingReference() + " completed. Final Bill: ₹" + finalTotal + ", Invoice: " + invNum,
                    "INFO",
                    "TRIP_COMPLETED",
                    booking.getBookingReference(),
                    "/operations/bookings/" + booking.getBookingReference()
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification for trip closing: {}", ex.getMessage());
        }

        return BookingResponse.fromEntityForVendor(saved);
    }

    public BigDecimal calculateVendorPayoutForBooking(Booking booking, Vehicle vehicle) {
        if (booking == null) return null;
        try {
            String model = (vehicle != null && vehicle.getModel() != null && !vehicle.getModel().isBlank())
                    ? vehicle.getModel() : null;
            String category = (booking.getVehicleCategory() != null && !booking.getVehicleCategory().isBlank())
                    ? booking.getVehicleCategory()
                    : (vehicle != null && vehicle.getVehicleType() != null ? vehicle.getVehicleType() : "Hatchback");
            String seating = (vehicle != null && vehicle.getSeatingCapacity() != null)
                    ? String.valueOf(vehicle.getSeatingCapacity()) : "4";

            String pickupDateStr = (booking.getPickupDateTime() != null)
                    ? booking.getPickupDateTime().toLocalDate().toString()
                    : LocalDate.now().toString();
            String pickupTimeStr = (booking.getPickupDateTime() != null)
                    ? booking.getPickupDateTime().toLocalTime().toString()
                    : "09:00";

            String rawTripType = (booking.getTripType() != null) ? booking.getTripType().toUpperCase() : "OUTSTATION";
            String serviceType = "OUTSTATION";
            if (rawTripType.contains("LOCAL") || rawTripType.contains("HOURLY")) {
                serviceType = "LOCAL";
            } else if (rawTripType.contains("AIRPORT")) {
                serviceType = "AIRPORT";
            }

            String rawCity = booking.getPickupCity();
            String city = rawCity != null ? rawCity.split(",")[0].trim() : null;
            String state = (rawCity != null && rawCity.contains(",")) ? rawCity.split(",")[1].trim() : null;

            var tariffs = vehicleTariffService.getTariffsForService(serviceType);
            String fuelType = vehicle != null ? vehicle.getFuelType() : null;
            Map<String, Object> rateContext = vehicleTariffService.calculateRate(
                    category, model, seating, fuelType, pickupDateStr, pickupTimeStr, serviceType, city, state, tariffs
            );

            int distanceKm = extractDistanceKm(booking);

            BigDecimal finalPayout;
            if ("AIRPORT".equalsIgnoreCase(serviceType)) {
                BigDecimal airportVendorFare = (BigDecimal) rateContext.get("airportVendorFare");
                Integer airportIncludedKm = (Integer) rateContext.get("airportIncludedKm");
                BigDecimal airportVendorExtraKmRate = (BigDecimal) rateContext.get("airportVendorExtraKmRate");
                if (airportVendorFare == null) airportVendorFare = new BigDecimal("850.00");
                if (airportIncludedKm == null) airportIncludedKm = 35;
                if (airportVendorExtraKmRate == null) airportVendorExtraKmRate = new BigDecimal("11.00");

                if (distanceKm <= airportIncludedKm) {
                    finalPayout = airportVendorFare;
                } else {
                    int extraKm = distanceKm - airportIncludedKm;
                    finalPayout = airportVendorFare.add(airportVendorExtraKmRate.multiply(BigDecimal.valueOf(extraKm)));
                }
            } else if ("LOCAL".equalsIgnoreCase(serviceType)) {
                BigDecimal hourlyVendorFare = (BigDecimal) rateContext.get("hourlyVendorFare");
                Integer packageKm = (Integer) rateContext.get("packageKm");
                BigDecimal vendorExtraKmRate = (BigDecimal) rateContext.get("vendorExtraKmRate");
                if (hourlyVendorFare == null) hourlyVendorFare = new BigDecimal("1500.00");
                if (packageKm == null) packageKm = 80;
                if (vendorExtraKmRate == null) vendorExtraKmRate = new BigDecimal("12.00");

                if (distanceKm <= packageKm) {
                    finalPayout = hourlyVendorFare;
                } else {
                    int extraKm = distanceKm - packageKm;
                    finalPayout = hourlyVendorFare.add(vendorExtraKmRate.multiply(BigDecimal.valueOf(extraKm)));
                }
            } else {
                // OUTSTATION: Exactly vendorRatePerKm * distanceKm (with vendorBaseFare as minimum guarantee floor)
                BigDecimal vendorRatePerKm = (BigDecimal) rateContext.get("vendorRatePerKm");
                if (vendorRatePerKm == null || vendorRatePerKm.compareTo(BigDecimal.ZERO) <= 0) {
                    vendorRatePerKm = new BigDecimal("9.50");
                }

                BigDecimal payout = vendorRatePerKm.multiply(BigDecimal.valueOf(distanceKm));
                BigDecimal vendorBaseFare = (BigDecimal) rateContext.get("vendorBaseFare");
                if (vendorBaseFare != null && vendorBaseFare.compareTo(BigDecimal.ZERO) > 0 && payout.compareTo(vendorBaseFare) < 0) {
                    payout = vendorBaseFare;
                }

                finalPayout = payout;
            }

            if (Boolean.TRUE.equals(booking.getIsPetFriendly())) {
                BigDecimal vendorPetCharge = (BigDecimal) rateContext.get("vendorPetCharge");
                if (vendorPetCharge == null || vendorPetCharge.compareTo(BigDecimal.ZERO) <= 0) {
                    vendorPetCharge = new BigDecimal("350.00");
                }
                finalPayout = finalPayout.add(vendorPetCharge);
            }

            return finalPayout.setScale(2, RoundingMode.HALF_UP);
        } catch (Exception ex) {
            log.warn("Could not calculate tariff vendor payout: {}", ex.getMessage());
            return null;
        }
    }

    private int extractDistanceKm(Booking booking) {
        if (booking == null) return 150;
        if (booking.getSpecialInstructions() != null) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("Distance:\\s*(\\d+)\\s*km", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(booking.getSpecialInstructions());
            if (m.find()) {
                try {
                    return Integer.parseInt(m.group(1));
                } catch (Exception ignored) {}
            }
        }
        try {
            int d = publicVehicleService.calculateDistance(booking.getPickupCity(), booking.getDropCity(), booking.getTripType());
            if (d > 0) return d;
        } catch (Exception ignored) {}
        return 150;
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

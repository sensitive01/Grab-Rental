package com.grabrentals.vendor.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.customer.service.CustomerBookingService;
import com.grabrentals.security.CustomUserDetails;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import com.grabrentals.vendor.dto.DriverResponse;
import com.grabrentals.vendor.dto.VehicleResponse;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.entity.VendorProfile;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.vendor.repository.VendorProfileRepository;
import com.grabrentals.vendor.service.VendorDriverService;
import com.grabrentals.vendor.service.VendorVehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping({"/api/vendor", "/api/fleet"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class VendorController {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;
    private final VendorVehicleService vendorVehicleService;
    private final VendorDriverService vendorDriverService;
    private final CustomerBookingService customerBookingService;

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        List<Vehicle> vehicles = vehicleRepository.findByUserIdOrderByCreatedAtDesc(vendorId);
        List<Driver> drivers = driverRepository.findByUserIdOrderByCreatedAtDesc(vendorId);
        List<Booking> bookings = bookingRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);

        long totalVehicles = vehicles.size();
        long availableVehicles = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();

        long totalDrivers = drivers.size();
        long availableDrivers = drivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();

        long pendingRequests = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.ASSIGNED_TO_VENDOR)
                .count();

        long activeTrips = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                        || b.getStatus() == BookingStatus.ON_THE_WAY
                        || b.getStatus() == BookingStatus.IN_TRANSIT)
                .count();

        long completedTrips = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        long cancelledBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED
                        || b.getStatus() == BookingStatus.REASSIGN_REQUIRED)
                .count();

        BigDecimal totalEarnings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getTotalFare() != null)
                .map(Booking::getTotalFare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> kpi = new HashMap<>();
        kpi.put("totalVehicles", totalVehicles);
        kpi.put("availableVehicles", availableVehicles);
        kpi.put("totalDrivers", totalDrivers);
        kpi.put("availableDrivers", availableDrivers);
        kpi.put("pendingRequests", pendingRequests);
        kpi.put("activeTrips", activeTrips);
        kpi.put("completedTrips", completedTrips);
        kpi.put("cancelledBookings", cancelledBookings);
        kpi.put("totalEarnings", totalEarnings);
        kpi.put("netEarnings", totalEarnings.multiply(BigDecimal.valueOf(0.90))); // 90% vendor payout
        kpi.put("pendingPayout", totalEarnings.multiply(BigDecimal.valueOf(0.25)));

        List<BookingResponse> recentBookings = bookings.stream()
                .limit(10)
                .map(BookingResponse::fromEntity)
                .toList();

        List<VehicleResponse> vehicleResponses = vendorVehicleService.getVendorVehicles(vendorId);
        List<DriverResponse> driverResponses = vendorDriverService.getVendorDrivers(vendorId);

        Map<String, Object> data = new HashMap<>();
        data.put("kpi", kpi);
        data.put("recentBookings", recentBookings);
        data.put("vehicles", vehicleResponses);
        data.put("drivers", driverResponses);

        return ResponseEntity.ok(ApiResponse.success("Dynamic vendor dashboard data", data));
    }

    @GetMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        VendorProfile profile = vendorProfileRepository.findByUserId(vendorId)
                .orElseGet(() -> {
                    VendorProfile newProfile = VendorProfile.builder()
                            .user(vendor)
                            .companyName(vendor.getBusinessName() != null && !vendor.getBusinessName().isBlank()
                                    ? vendor.getBusinessName()
                                    : vendor.getName() + " Logistics")
                            .contactPerson(vendor.getName())
                            .tradeName(vendor.getName())
                            .address(vendor.getCity() != null ? vendor.getCity() : "India")
                            .fleetSize((int) vehicleRepository.countByUserId(vendorId))
                            .build();
                    return vendorProfileRepository.save(newProfile);
                });

        Map<String, Object> map = new HashMap<>();
        map.put("id", profile.getId());
        map.put("userId", vendor.getId());
        map.put("businessName", profile.getCompanyName());
        map.put("tradeName", profile.getTradeName() != null ? profile.getTradeName() : profile.getCompanyName());
        map.put("ownerName", vendor.getName());
        map.put("contactPerson", profile.getContactPerson() != null ? profile.getContactPerson() : vendor.getName());
        map.put("email", vendor.getEmail());
        map.put("phone", vendor.getPhone());
        map.put("altPhone", vendor.getAlternatePhone() != null ? vendor.getAlternatePhone() : "");
        map.put("address", profile.getAddress() != null ? profile.getAddress() : (vendor.getCity() != null ? vendor.getCity() : ""));
        map.put("gstin", profile.getGstin() != null ? profile.getGstin() : "");
        map.put("pan", profile.getPan() != null ? profile.getPan() : "");
        map.put("bankName", profile.getBankName() != null ? profile.getBankName() : "");
        map.put("accountNumber", profile.getAccountNumber() != null ? profile.getAccountNumber() : "");
        map.put("ifsc", profile.getIfsc() != null ? profile.getIfsc() : "");
        map.put("branch", profile.getBranch() != null ? profile.getBranch() : "");
        map.put("fleetSize", vehicleRepository.countByUserId(vendorId));

        return ResponseEntity.ok(ApiResponse.success("Vendor profile retrieved successfully", map));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> updates
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        VendorProfile profile = vendorProfileRepository.findByUserId(vendorId)
                .orElseGet(() -> VendorProfile.builder()
                        .user(vendor)
                        .companyName(vendor.getName() + " Logistics")
                        .build());

        if (updates.containsKey("businessName")) {
            String bName = String.valueOf(updates.get("businessName"));
            profile.setCompanyName(bName);
            vendor.setBusinessName(bName);
        }
        if (updates.containsKey("tradeName")) {
            profile.setTradeName(String.valueOf(updates.get("tradeName")));
        }
        if (updates.containsKey("contactPerson")) {
            profile.setContactPerson(String.valueOf(updates.get("contactPerson")));
        }
        if (updates.containsKey("address")) {
            profile.setAddress(String.valueOf(updates.get("address")));
        }
        if (updates.containsKey("gstin")) {
            profile.setGstin(String.valueOf(updates.get("gstin")));
        }
        if (updates.containsKey("pan")) {
            profile.setPan(String.valueOf(updates.get("pan")));
        }
        if (updates.containsKey("bankName")) {
            profile.setBankName(String.valueOf(updates.get("bankName")));
        }
        if (updates.containsKey("accountNumber")) {
            profile.setAccountNumber(String.valueOf(updates.get("accountNumber")));
        }
        if (updates.containsKey("ifsc")) {
            profile.setIfsc(String.valueOf(updates.get("ifsc")));
        }
        if (updates.containsKey("branch")) {
            profile.setBranch(String.valueOf(updates.get("branch")));
        }
        if (updates.containsKey("altPhone")) {
            vendor.setAlternatePhone(String.valueOf(updates.get("altPhone")));
        }
        if (updates.containsKey("phone")) {
            vendor.setPhone(String.valueOf(updates.get("phone")));
        }
        if (updates.containsKey("ownerName")) {
            vendor.setName(String.valueOf(updates.get("ownerName")));
        }

        userRepository.save(vendor);
        profile.setFleetSize((int) vehicleRepository.countByUserId(vendorId));
        vendorProfileRepository.save(profile);

        return getProfile(userDetails);
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

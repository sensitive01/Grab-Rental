package com.grabrentals.vendor.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.dto.BookingStatusUpdateRequest;
import com.grabrentals.customer.dto.TripClosingRequest;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.service.CustomerBookingService;
import com.grabrentals.security.CustomUserDetails;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.repository.DriverRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/driver/trips")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DRIVER', 'FLEET', 'VENDOR', 'ADMIN')")
public class DriverTripController {

    private final CustomerBookingService bookingService;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getDriverTrips(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) BookingStatus status
    ) {
        User driverUser = getUser(userDetails);
        log.info("[DRIVER API] GET /api/driver/trips for chauffeur '{}' ({})", driverUser.getName(), driverUser.getPhone());
        List<BookingResponse> trips = bookingService.getDriverBookings(driverUser, status);
        return ResponseEntity.ok(ApiResponse.success("Driver assigned trips retrieved successfully", trips));
    }

    @GetMapping("/{idOrRef}")
    public ResponseEntity<ApiResponse<BookingResponse>> getTripDetails(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef
    ) {
        User driverUser = getUser(userDetails);
        log.info("[DRIVER API] GET /api/driver/trips/{} for chauffeur '{}'", idOrRef, driverUser.getPhone());
        BookingResponse trip = bookingService.getDriverBookingByIdOrRef(idOrRef, driverUser);
        return ResponseEntity.ok(ApiResponse.success("Trip details retrieved successfully", trip));
    }

    @PatchMapping("/{idOrRef}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateTripStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        User driverUser = getUser(userDetails);
        log.info("[DRIVER API] PATCH /api/driver/trips/{}/status to {} by chauffeur '{}'", idOrRef, request.getStatus(), driverUser.getPhone());
        BookingResponse response = bookingService.updateTripStatus(idOrRef, request, driverUser);
        return ResponseEntity.ok(ApiResponse.success("Trip status updated successfully to " + request.getStatus(), response));
    }

    @PostMapping("/{idOrRef}/complete-trip")
    public ResponseEntity<ApiResponse<BookingResponse>> completeTrip(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef,
            @Valid @RequestBody TripClosingRequest request
    ) {
        User driverUser = getUser(userDetails);
        log.info("[DRIVER API] POST /api/driver/trips/{}/complete-trip by chauffeur '{}'", idOrRef, driverUser.getPhone());
        BookingResponse response = bookingService.vendorCompleteTrip(idOrRef, request, driverUser);
        return ResponseEntity.ok(ApiResponse.success("Trip finalized and completed successfully. GST invoice generated.", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDriverProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User driverUser = getUser(userDetails);
        Driver driver = driverRepository.findByNormalizedPhone(driverUser.getPhone()).orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("id", driver != null ? driver.getId() : driverUser.getId());
        data.put("name", driver != null ? driver.getName() : driverUser.getName());
        data.put("phone", driverUser.getPhone());
        data.put("role", driverUser.getRole() != null ? driverUser.getRole().name() : "DRIVER");

        if (driver != null) {
            data.put("licenseNumber", driver.getLicenseNumber());
            data.put("licenseExpiry", driver.getLicenseExpiry());
            data.put("status", driver.getStatus() != null ? driver.getStatus().name() : "AVAILABLE");
            data.put("experienceYears", driver.getExperienceYears());
            data.put("photoUrl", driver.getPhotoUrl());

            if (driver.getUser() != null) {
                data.put("fleetOwnerName", driver.getUser().getName());
                data.put("fleetBusinessName", driver.getUser().getBusinessName() != null ? driver.getUser().getBusinessName() : driver.getUser().getName());
                data.put("fleetOwnerPhone", driver.getUser().getPhone());
            }

            if (driver.getAssignedVehicle() != null) {
                data.put("vehicleNumber", driver.getAssignedVehicle().getVehicleNumber());
                data.put("vehicleModel", driver.getAssignedVehicle().getModel());
                data.put("vehicleType", driver.getAssignedVehicle().getVehicleType());
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Driver profile loaded successfully", data));
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

package com.grabrentals.operations.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingAssignRequest;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.dto.BookingStatusUpdateRequest;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.service.CustomerBookingService;
import com.grabrentals.vendor.dto.DriverResponse;
import com.grabrentals.vendor.dto.VehicleResponse;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.security.CustomUserDetails;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OPERATIONS', 'ADMIN')")
public class OperationsBookingController {

    private final CustomerBookingService bookingService;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @RequestParam(required = false) BookingStatus status
    ) {
        log.info("[HTTP API] GET /api/operations/bookings - filtering by status: {}", status);
        List<BookingResponse> list = bookingService.getOperationsBookings(status);
        return ResponseEntity.ok(ApiResponse.success("Operations bookings retrieved successfully", list));
    }

    @GetMapping("/bookings/{idOrRef}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable String idOrRef
    ) {
        BookingResponse response = bookingService.getBookingDetails(idOrRef);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", response));
    }

    @PostMapping("/bookings/{idOrRef}/assign")
    public ResponseEntity<ApiResponse<BookingResponse>> assignVehicleAndDriver(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef,
            @Valid @RequestBody BookingAssignRequest request
    ) {
        User operationsUser = getUser(userDetails);
        log.info("[HTTP API] POST /api/operations/bookings/{}/assign - Vehicle: {}, Driver: {} by {}",
                idOrRef, request.getVehicleId(), request.getDriverId(), operationsUser.getEmail());

        BookingResponse response = bookingService.assignVehicleAndDriver(idOrRef, request, operationsUser);
        return ResponseEntity.ok(ApiResponse.success("Vehicle and driver appointed successfully. Booking routed to vendor for acceptance.", response));
    }

    @PatchMapping("/bookings/{idOrRef}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        User operationsUser = getUser(userDetails);
        log.info("[HTTP API] PATCH /api/operations/bookings/{}/status to {} by {}",
                idOrRef, request.getStatus(), operationsUser.getEmail());

        BookingResponse response = bookingService.updateTripStatus(idOrRef, request.getStatus(), operationsUser);
        return ResponseEntity.ok(ApiResponse.success("Trip status updated successfully to " + request.getStatus(), response));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        List<VehicleResponse> vehicles = vehicleRepository.findAll()
                .stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All vehicles retrieved", vehicles));
    }

    @GetMapping("/vehicles/available")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAvailableVehicles() {
        List<VehicleResponse> vehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE)
                .stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Available vehicles retrieved", vehicles));
    }

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers() {
        List<DriverResponse> drivers = driverRepository.findAll()
                .stream()
                .map(DriverResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All drivers retrieved", drivers));
    }

    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAvailableDrivers() {
        List<DriverResponse> drivers = driverRepository.findByStatus(DriverStatus.AVAILABLE)
                .stream()
                .map(DriverResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Available drivers retrieved", drivers));
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

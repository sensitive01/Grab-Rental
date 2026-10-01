package com.grabrentals.vendor.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.dto.BookingStatusUpdateRequest;
import com.grabrentals.customer.dto.VendorDeclineRequest;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.service.CustomerBookingService;
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

@Slf4j
@RestController
@RequestMapping({"/api/vendor/bookings", "/api/fleet/bookings"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class VendorBookingController {

    private final CustomerBookingService bookingService;
    private final UserRepository userRepository;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User vendor = getUser(userDetails);
        log.info("[HTTP API] GET /api/fleet/bookings/requests for vendor '{}'", vendor.getEmail());
        List<BookingResponse> requests = bookingService.getVendorBookings(vendor, BookingStatus.ASSIGNED_TO_VENDOR);
        return ResponseEntity.ok(ApiResponse.success("Pending booking requests retrieved successfully", requests));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) BookingStatus status
    ) {
        User vendor = getUser(userDetails);
        List<BookingResponse> bookings = bookingService.getVendorBookings(vendor, status);
        return ResponseEntity.ok(ApiResponse.success("Vendor bookings retrieved successfully", bookings));
    }

    @GetMapping("/{idOrRef}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef
    ) {
        User vendor = getUser(userDetails);
        BookingResponse booking = bookingService.getVendorBookingByIdOrRef(idOrRef, vendor);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<BookingResponse>> acceptBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        User vendor = getUser(userDetails);
        log.info("[HTTP API] POST /api/fleet/bookings/{}/accept by vendor '{}'", id, vendor.getEmail());
        BookingResponse response = bookingService.vendorAcceptBooking(id, vendor);
        return ResponseEntity.ok(ApiResponse.success("Booking accepted and confirmed successfully! Driver and car dispatched.", response));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<ApiResponse<BookingResponse>> declineBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody VendorDeclineRequest request
    ) {
        User vendor = getUser(userDetails);
        log.info("[HTTP API] POST /api/fleet/bookings/{}/decline by vendor '{}' - Reason: {}", id, vendor.getEmail(), request.getReason());
        BookingResponse response = bookingService.vendorDeclineBooking(id, request, vendor);
        return ResponseEntity.ok(ApiResponse.success("Booking declined and returned to operations for re-assignment.", response));
    }

    @PatchMapping("/{idOrRef}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        User vendor = getUser(userDetails);
        log.info("[HTTP API] PATCH /api/fleet/bookings/{}/status to {} by vendor '{}'", idOrRef, request.getStatus(), vendor.getEmail());
        BookingResponse response = bookingService.updateTripStatus(idOrRef, request.getStatus(), vendor);
        return ResponseEntity.ok(ApiResponse.success("Trip status updated successfully to " + request.getStatus(), response));
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

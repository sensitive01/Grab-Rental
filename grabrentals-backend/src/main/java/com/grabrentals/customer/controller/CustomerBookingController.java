package com.grabrentals.customer.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingCreateRequest;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.service.CustomerBookingService;
import com.grabrentals.security.CustomUserDetails;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/customer/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerBookingController {

    private final CustomerBookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingCreateRequest request,
            HttpServletRequest servletRequest
    ) {
        User customer = getUser(userDetails);
        log.info("[HTTP API] POST /api/customer/bookings - Customer '{}' creating booking for category {}", customer.getEmail(), request.getVehicleCategory());
        BookingResponse response = bookingService.createBooking(request, customer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking request created successfully and forwarded to operations dispatch", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User customer = getUser(userDetails);
        List<BookingResponse> list = bookingService.getCustomerBookings(customer);
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved successfully", list));
    }

    @GetMapping("/{idOrRef}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef
    ) {
        User customer = getUser(userDetails);
        BookingResponse response = bookingService.getCustomerBookingByIdOrRef(idOrRef, customer);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", response));
    }

    @PostMapping("/{idOrRef}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String idOrRef
    ) {
        User customer = getUser(userDetails);
        log.info("[HTTP API] POST /api/customer/bookings/{}/cancel by customer '{}'", idOrRef, customer.getEmail());
        BookingResponse response = bookingService.cancelCustomerBookingByIdOrRef(idOrRef, customer);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

package com.grabrentals.customer.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.VehicleSearchResponseDto;
import com.grabrentals.customer.service.PublicVehicleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class PublicVehicleController {

    private final PublicVehicleService publicVehicleService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<VehicleSearchResponseDto>> searchVehicles(
            @RequestParam(required = false, defaultValue = "Bangalore") String from,
            @RequestParam(required = false, defaultValue = "Coimbatore") String to,
            @RequestParam(required = false) String stops,
            @RequestParam(required = false, defaultValue = "ONE_WAY") String tripType,
            @RequestParam(required = false) String pickupDate,
            @RequestParam(required = false) String pickupTime,
            HttpServletRequest request
    ) {
        log.info("[PUBLIC VEHICLE API] GET /api/vehicles/search?from={}&to={}&stops={}&tripType={}", from, to, stops, tripType);
        VehicleSearchResponseDto response = publicVehicleService.searchVehicles(from, to, stops, tripType, pickupDate, pickupTime);
        return ResponseEntity.ok(ApiResponse.<VehicleSearchResponseDto>builder()
                .success(true)
                .message("Available outstation vehicles and live packages retrieved successfully")
                .data(response)
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping("/booking/{bookingReference}")
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.BookingResponse>> getBookingByReference(
            @org.springframework.web.bind.annotation.PathVariable String bookingReference,
            HttpServletRequest request
    ) {
        log.info("[PUBLIC VEHICLE API] GET /api/vehicles/booking/{}", bookingReference);
        com.grabrentals.customer.dto.BookingResponse booking = publicVehicleService.getBookingByReference(bookingReference);
        return ResponseEntity.ok(ApiResponse.<com.grabrentals.customer.dto.BookingResponse>builder()
                .success(true)
                .message("Booking details retrieved successfully")
                .data(booking)
                .path(request.getRequestURI())
                .build());
    }
}

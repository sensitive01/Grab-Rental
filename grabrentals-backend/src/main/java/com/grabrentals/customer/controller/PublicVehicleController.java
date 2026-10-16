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
    private final com.grabrentals.vendor.repository.VehicleRepository vehicleRepository;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<VehicleSearchResponseDto>> searchVehicles(
            @RequestParam(required = false, defaultValue = "Bangalore") String from,
            @RequestParam(required = false) String fromCity,
            @RequestParam(required = false, defaultValue = "Coimbatore") String to,
            @RequestParam(required = false) String stops,
            @RequestParam(required = false, defaultValue = "ONE_WAY") String tripType,
            @RequestParam(required = false) String pickupDate,
            @RequestParam(required = false) String pickupTime,
            @RequestParam(required = false, defaultValue = "OUTSTATION") String serviceType,
            @RequestParam(required = false) Integer distanceKm,
            HttpServletRequest request
    ) {
        log.info("[PUBLIC VEHICLE API] GET /api/vehicles/search?from={}&fromCity={}&to={}&stops={}&tripType={}&serviceType={}&distanceKm={}", from, fromCity, to, stops, tripType, serviceType, distanceKm);
        VehicleSearchResponseDto response = publicVehicleService.searchVehicles(from, fromCity, to, stops, tripType, pickupDate, pickupTime, serviceType, distanceKm);
        return ResponseEntity.ok(ApiResponse.<VehicleSearchResponseDto>builder()
                .success(true)
                .message("Available vehicles and live packages retrieved successfully")
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

    @GetMapping("/check-plate")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> checkPlate(
            @RequestParam("plate") String plate,
            HttpServletRequest request
    ) {
        String rawPlate = plate != null ? plate.trim() : "";
        String compactPlate = rawPlate.replaceAll("[\\s-]+", "").toUpperCase();
        boolean exists = false;
        if (!compactPlate.isBlank()) {
            exists = vehicleRepository.existsByNormalizedVehicleNumber(compactPlate);
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("plateNumber", rawPlate.toUpperCase());
        data.put("available", !exists);
        data.put("exists", exists);
        if (exists) {
            data.put("message", "Vehicle plate number '" + rawPlate.toUpperCase() + "' is already registered on Grab Rentals by another fleet partner. Duplicate vehicles cannot be added.");
        } else {
            data.put("message", "Vehicle plate number is available.");
        }

        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, Object>>builder()
                .success(true)
                .message("Plate availability check completed")
                .data(data)
                .path(request.getRequestURI())
                .build());
    }
}

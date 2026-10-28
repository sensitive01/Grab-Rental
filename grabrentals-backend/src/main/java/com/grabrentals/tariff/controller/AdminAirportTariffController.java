package com.grabrentals.tariff.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.tariff.dto.AirportTariffRequest;
import com.grabrentals.tariff.dto.AirportTariffResponse;
import com.grabrentals.tariff.service.AirportTariffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/airport-tariffs")
@RequiredArgsConstructor
public class AdminAirportTariffController {

    private final AirportTariffService airportTariffService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AirportTariffResponse>>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String tripDirection,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String pricingType,
            @RequestParam(required = false) String status
    ) {
        List<AirportTariffResponse> list = airportTariffService.getAllTariffs(city, tripDirection, category, pricingType, status);
        return ResponseEntity.ok(ApiResponse.success("Airport tariffs retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AirportTariffResponse>> getById(@PathVariable UUID id) {
        AirportTariffResponse res = airportTariffService.getTariffById(id);
        return ResponseEntity.ok(ApiResponse.success("Airport tariff retrieved", res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AirportTariffResponse>> saveOrUpdate(
            @Valid @RequestBody AirportTariffRequest request
    ) {
        AirportTariffResponse saved = airportTariffService.saveOrUpdateTariff(request);
        return ResponseEntity.ok(ApiResponse.success("Airport tariff saved successfully", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        airportTariffService.deleteTariff(id);
        return ResponseEntity.ok(ApiResponse.success("Airport tariff deleted successfully", null));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AirportTariffResponse>> toggleStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "ACTIVE");
        AirportTariffResponse updated = airportTariffService.toggleStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, updated));
    }

    @PostMapping("/seed-defaults")
    public ResponseEntity<ApiResponse<List<AirportTariffResponse>>> seedDefaults() {
        airportTariffService.seedDefaultAirportTariffs();
        List<AirportTariffResponse> all = airportTariffService.getAllTariffs(null, null, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("Default airport tariffs seeded successfully", all));
    }
}

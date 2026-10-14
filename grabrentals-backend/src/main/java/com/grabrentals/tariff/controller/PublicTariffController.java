package com.grabrentals.tariff.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.tariff.dto.VehicleModelConfigResponse;
import com.grabrentals.tariff.service.VehicleTariffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class PublicTariffController {

    private final VehicleTariffService tariffService;

    @GetMapping("/models")
    public ResponseEntity<ApiResponse<List<VehicleModelConfigResponse>>> getActiveModels() {
        List<VehicleModelConfigResponse> list = tariffService.getActiveModelConfigs();
        return ResponseEntity.ok(ApiResponse.success("Active vehicle models retrieved", list));
    }

    @GetMapping("/category-presets")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getCategoryPresets() {
        return ResponseEntity.ok(ApiResponse.success("Category presets retrieved", tariffService.getCategoryModelPresets()));
    }

    @GetMapping("/rate-calculator")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateRate(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String seatingCapacity,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) String serviceType
    ) {
        Map<String, Object> result = tariffService.calculateRate(category, model, seatingCapacity, fuelType, date, time, serviceType, null, null, null);
        return ResponseEntity.ok(ApiResponse.success("Calculated rate retrieved", result));
    }

    @GetMapping("/tariffs")
    public ResponseEntity<ApiResponse<List<com.grabrentals.tariff.dto.VehicleTariffResponse>>> getPublicTariffs() {
        return ResponseEntity.ok(ApiResponse.success("All tariffs retrieved", tariffService.getAllTariffs()));
    }
}

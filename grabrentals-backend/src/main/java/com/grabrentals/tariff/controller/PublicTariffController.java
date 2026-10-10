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

    @GetMapping("/rate-calculator")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateRate(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String seatingCapacity,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String time
    ) {
        Map<String, Object> result = tariffService.calculateRate(category, model, seatingCapacity, date, time);
        return ResponseEntity.ok(ApiResponse.success("Calculated rate retrieved", result));
    }

    @GetMapping("/tariffs")
    public ResponseEntity<ApiResponse<List<com.grabrentals.tariff.dto.VehicleTariffResponse>>> getPublicTariffs() {
        return ResponseEntity.ok(ApiResponse.success("All tariffs retrieved", tariffService.getAllTariffs()));
    }
}

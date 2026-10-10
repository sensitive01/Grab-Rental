package com.grabrentals.tariff.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.tariff.dto.*;
import com.grabrentals.tariff.service.VehicleTariffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.grabrentals.vendor.service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminTariffController {
 
    private final VehicleTariffService tariffService;
    private final CloudinaryService cloudinaryService;

    // ==========================================
    // VEHICLE MODEL CONFIGS & COMMON PHOTOS
    // ==========================================

    @GetMapping("/models")
    public ResponseEntity<ApiResponse<List<VehicleModelConfigResponse>>> getAllModels() {
        List<VehicleModelConfigResponse> list = tariffService.getAllModelConfigs();
        return ResponseEntity.ok(ApiResponse.success("Vehicle model configurations retrieved", list));
    }

    @PostMapping("/models")
    public ResponseEntity<ApiResponse<VehicleModelConfigResponse>> saveModel(
            @Valid @RequestBody VehicleModelConfigRequest request
    ) {
        VehicleModelConfigResponse saved = tariffService.saveOrUpdateModelConfig(request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model saved successfully", saved));
    }

    @PostMapping(value = "/models/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadModelPhoto(
            @RequestParam("file") MultipartFile file
    ) {
        String url = cloudinaryService.uploadFile(file, "grabrentals/models", null);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", Map.of("url", url)));
    }

    @DeleteMapping("/models/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllModels() {
        tariffService.deleteAllModelConfigs();
        return ResponseEntity.ok(ApiResponse.success("All vehicle models deleted successfully", null));
    }

    @DeleteMapping("/models/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteModel(@PathVariable UUID id) {
        tariffService.deleteModelConfig(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model deleted successfully", null));
    }

    // ==========================================
    // TARIFFS & PRICING MATRIX
    // ==========================================

    @GetMapping("/tariffs")
    public ResponseEntity<ApiResponse<List<VehicleTariffResponse>>> getAllTariffs() {
        List<VehicleTariffResponse> list = tariffService.getAllTariffs();
        return ResponseEntity.ok(ApiResponse.success("All tariffs retrieved", list));
    }

    @GetMapping("/tariffs/standard")
    public ResponseEntity<ApiResponse<List<VehicleTariffResponse>>> getStandardTariffs() {
        List<VehicleTariffResponse> list = tariffService.getStandardTariffs();
        return ResponseEntity.ok(ApiResponse.success("Standard tariffs retrieved", list));
    }

    @GetMapping("/tariffs/seasonal")
    public ResponseEntity<ApiResponse<List<VehicleTariffResponse>>> getSeasonalTariffs() {
        List<VehicleTariffResponse> list = tariffService.getSeasonalTariffs();
        return ResponseEntity.ok(ApiResponse.success("Seasonal tariffs retrieved", list));
    }

    @PostMapping("/tariffs")
    public ResponseEntity<ApiResponse<VehicleTariffResponse>> saveTariff(
            @Valid @RequestBody VehicleTariffRequest request
    ) {
        VehicleTariffResponse saved = tariffService.saveOrUpdateTariff(request);
        return ResponseEntity.ok(ApiResponse.success("Tariff saved successfully", saved));
    }

    @DeleteMapping("/tariffs/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllTariffs() {
        tariffService.deleteAllTariffs();
        return ResponseEntity.ok(ApiResponse.success("All tariffs deleted successfully", null));
    }

    @DeleteMapping("/tariffs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTariff(@PathVariable UUID id) {
        tariffService.deleteTariff(id);
        return ResponseEntity.ok(ApiResponse.success("Tariff deleted successfully", null));
    }
}

package com.grabrentals.fleet.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.fleet.dto.CloudinarySignatureResponse;
import com.grabrentals.fleet.dto.CreateVehicleRequest;
import com.grabrentals.fleet.dto.VehicleResponse;
import com.grabrentals.fleet.service.CloudinaryService;
import com.grabrentals.fleet.service.FleetVehicleService;
import com.grabrentals.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/fleet/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class FleetVehicleController {

    private final FleetVehicleService fleetVehicleService;
    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "grabrentals/vehicles") String folder,
            @RequestParam(value = "preset", required = false) String preset,
            HttpServletRequest request
    ) {
        log.info("[HTTP API] POST /api/fleet/vehicles/upload by vendor '{}' ({}) [preset: {}]", userDetails.getEmail(), userDetails.getId(), preset);
        String url = cloudinaryService.uploadFile(file, folder, preset);
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("File uploaded successfully to Cloudinary")
                .data(Map.of("url", url))
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping("/upload-signature")
    public ResponseEntity<ApiResponse<CloudinarySignatureResponse>> getUploadSignature(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false, defaultValue = "grabrentals/vehicles") String folder,
            HttpServletRequest request
    ) {
        log.info("[HTTP API] GET /api/fleet/vehicles/upload-signature requested by vendor '{}'", userDetails.getEmail());
        CloudinarySignatureResponse signature = cloudinaryService.generateUploadSignature(folder);
        return ResponseEntity.ok(ApiResponse.<CloudinarySignatureResponse>builder()
                .success(true)
                .message("Upload signature generated successfully")
                .data(signature)
                .path(request.getRequestURI())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> registerVehicle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateVehicleRequest requestBody,
            HttpServletRequest request
    ) {
        log.info("============================================================");
        log.info("[FLEET REGISTRATION] Incoming vehicle registration request");
        log.info("  Vendor User : {} (ID: {})", userDetails.getEmail(), userDetails.getId());
        log.info("  Plate Number: {}", requestBody.getVehicleNumber());
        log.info("  Model       : {}", requestBody.getVehicleModel());
        log.info("  Type        : {}", requestBody.getVehicleType());
        log.info("  Daily Rate  : ₹{}", requestBody.getDailyRate());
        log.info("  Image URL   : {}", requestBody.getImageUrl());
        log.info("  RC Doc URL  : {}", requestBody.getRcDocumentUrl());
        log.info("  Insurance   : {}", requestBody.getInsuranceDocumentUrl());
        log.info("============================================================");

        VehicleResponse response = fleetVehicleService.registerVehicle(userDetails.getId(), requestBody);
        
        log.info("[FLEET REGISTRATION] Successfully registered vehicle ID: {}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<VehicleResponse>builder()
                .success(true)
                .message("Vehicle registered successfully into your fleet")
                .data(response)
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVendorVehicles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        List<VehicleResponse> vehicles = fleetVehicleService.getVendorVehicles(userDetails.getId());
        log.info("[HTTP API] GET /api/fleet/vehicles -> Returned {} vehicles for vendor '{}'", vehicles.size(), userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.<List<VehicleResponse>>builder()
                .success(true)
                .message("Fetched " + vehicles.size() + " fleet vehicles")
                .data(vehicles)
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        VehicleResponse vehicle = fleetVehicleService.getVehicleById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.<VehicleResponse>builder()
                .success(true)
                .message("Vehicle details retrieved")
                .data(vehicle)
                .path(request.getRequestURI())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        log.info("[HTTP API] DELETE /api/fleet/vehicles/{} requested by vendor '{}'", id, userDetails.getEmail());
        fleetVehicleService.deleteVehicle(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Vehicle removed successfully from your fleet")
                .data(null)
                .path(request.getRequestURI())
                .build());
    }
}

package com.grabrentals.fleet.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.fleet.dto.CreateDriverRequest;
import com.grabrentals.fleet.dto.DriverResponse;
import com.grabrentals.fleet.dto.UpdateDriverRequest;
import com.grabrentals.fleet.service.CloudinaryService;
import com.grabrentals.fleet.service.FleetDriverService;
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
@RequestMapping("/api/fleet/drivers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class FleetDriverController {

    private final FleetDriverService fleetDriverService;
    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "grabrentals/drivers") String folder,
            @RequestParam(value = "preset", required = false) String preset,
            HttpServletRequest request
    ) {
        log.info("[HTTP API] POST /api/fleet/drivers/upload by vendor '{}' ({}) [preset: {}]", userDetails.getEmail(), userDetails.getId(), preset);
        String url = cloudinaryService.uploadFile(file, folder, preset);
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Driver document uploaded successfully to Cloudinary")
                .data(Map.of("url", url))
                .path(request.getRequestURI())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DriverResponse>> registerDriver(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateDriverRequest requestBody,
            HttpServletRequest request
    ) {
        log.info("============================================================");
        log.info("[CHAUFFEUR REGISTRATION] Incoming driver registration request");
        log.info("  Vendor User    : {} (ID: {})", userDetails.getEmail(), userDetails.getId());
        log.info("  Driver Name    : {}", requestBody.getName());
        log.info("  Mobile Phone   : {}", requestBody.getPhone());
        log.info("  License Number : {}", requestBody.getLicenseNumber());
        log.info("  License Expiry : {}", requestBody.getLicenseExpiry());
        log.info("  Experience     : {} years", requestBody.getExperienceYears());
        log.info("  Assigned Asset : {}", requestBody.getAssignedVehicleId());
        log.info("  Photo URL      : {}", requestBody.getPhotoUrl());
        log.info("  License Doc URL: {}", requestBody.getLicenseDocumentUrl());
        log.info("============================================================");

        DriverResponse response = fleetDriverService.registerDriver(userDetails.getId(), requestBody);

        log.info("[CHAUFFEUR REGISTRATION] Successfully registered chauffeur ID: {}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DriverResponse>builder()
                .success(true)
                .message("Chauffeur registered successfully to your roster")
                .data(response)
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getVendorDrivers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        List<DriverResponse> drivers = fleetDriverService.getVendorDrivers(userDetails.getId());
        log.info("[HTTP API] GET /api/fleet/drivers -> Returned {} chauffeurs for vendor '{}'", drivers.size(), userDetails.getEmail());
        return ResponseEntity.ok(ApiResponse.<List<DriverResponse>>builder()
                .success(true)
                .message("Fetched " + drivers.size() + " roster chauffeurs")
                .data(drivers)
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriverById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        DriverResponse driver = fleetDriverService.getDriverById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.<DriverResponse>builder()
                .success(true)
                .message("Driver details retrieved")
                .data(driver)
                .path(request.getRequestURI())
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriver(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateDriverRequest requestBody,
            HttpServletRequest request
    ) {
        log.info("============================================================");
        log.info("[CHAUFFEUR UPDATE] Incoming driver update request for ID: {}", id);
        log.info("  Vendor User    : {} (ID: {})", userDetails.getEmail(), userDetails.getId());
        log.info("  Driver Name    : {}", requestBody.getName());
        log.info("  Mobile Phone   : {}", requestBody.getPhone());
        log.info("  License Number : {}", requestBody.getLicenseNumber());
        log.info("  Assigned Asset : {}", requestBody.getAssignedVehicleId());
        log.info("  Status         : {}", requestBody.getStatus());
        log.info("============================================================");

        DriverResponse response = fleetDriverService.updateDriver(userDetails.getId(), id, requestBody);

        return ResponseEntity.ok(ApiResponse.<DriverResponse>builder()
                .success(true)
                .message("Chauffeur details updated successfully")
                .data(response)
                .path(request.getRequestURI())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        log.info("[HTTP API] DELETE /api/fleet/drivers/{} requested by vendor '{}'", id, userDetails.getEmail());
        fleetDriverService.deleteDriver(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Chauffeur removed successfully from your roster")
                .data(null)
                .path(request.getRequestURI())
                .build());
    }
}

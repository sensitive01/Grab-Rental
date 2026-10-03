package com.grabrentals.vendor.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.vendor.dto.CreateDriverRequest;
import com.grabrentals.vendor.dto.DriverResponse;
import com.grabrentals.vendor.dto.UpdateDriverRequest;
import com.grabrentals.vendor.service.CloudinaryService;
import com.grabrentals.vendor.service.VendorDriverService;
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
@RequestMapping({"/api/vendor/drivers", "/api/fleet/drivers"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class VendorDriverController {

    private final VendorDriverService vendorDriverService;
    private final CloudinaryService cloudinaryService;

    @PreAuthorize("permitAll()")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "grabrentals/drivers") String folder,
            @RequestParam(value = "preset", required = false) String preset,
            HttpServletRequest request
    ) {
        String userEmail = userDetails != null ? userDetails.getEmail() : "onboarding-partner";
        String userId = userDetails != null && userDetails.getId() != null ? userDetails.getId().toString() : "new";
        log.info("[HTTP API] POST /api/fleet/drivers/upload by vendor '{}' ({}) [preset: {}]", userEmail, userId, preset);
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

        DriverResponse response = vendorDriverService.registerDriver(userDetails.getId(), requestBody);

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
        List<DriverResponse> drivers = vendorDriverService.getVendorDrivers(userDetails.getId());
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
        DriverResponse driver = vendorDriverService.getDriverById(userDetails.getId(), id);
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

        DriverResponse response = vendorDriverService.updateDriver(userDetails.getId(), id, requestBody);

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
        vendorDriverService.deleteDriver(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Chauffeur removed successfully from your roster")
                .data(null)
                .path(request.getRequestURI())
                .build());
    }
}

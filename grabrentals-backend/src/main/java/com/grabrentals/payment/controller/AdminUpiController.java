package com.grabrentals.payment.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.payment.dto.UpiConfigDto;
import com.grabrentals.payment.service.UpiConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/upi")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUpiController {

    private final UpiConfigService upiConfigService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<UpiConfigDto>> getConfig() {
        UpiConfigDto config = upiConfigService.getOrCreateConfig();
        return ResponseEntity.ok(ApiResponse.success("UPI configuration retrieved", config));
    }

    @PutMapping("/config")
    public ResponseEntity<ApiResponse<UpiConfigDto>> updateConfig(@Valid @RequestBody UpiConfigDto request) {
        UpiConfigDto updated = upiConfigService.updateConfig(request);
        return ResponseEntity.ok(ApiResponse.success("UPI configuration updated successfully", updated));
    }
}

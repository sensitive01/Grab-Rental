package com.grabrentals.tariff.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.tariff.entity.DriverAllowance;
import com.grabrentals.tariff.service.DriverAllowanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/driver-allowances")
@RequiredArgsConstructor
public class AdminDriverAllowanceController {

    private final DriverAllowanceService driverAllowanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverAllowance>>> getAllAllowances() {
        List<DriverAllowance> list = driverAllowanceService.getAllAllowances();
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rules retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverAllowance>> getAllowanceById(@PathVariable UUID id) {
        DriverAllowance allowance = driverAllowanceService.getAllowanceById(id);
        if (allowance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rule retrieved", allowance));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DriverAllowance>> createAllowance(@RequestBody DriverAllowance allowance) {
        DriverAllowance saved = driverAllowanceService.createAllowance(allowance);
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rule created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverAllowance>> updateAllowance(
            @PathVariable UUID id,
            @RequestBody DriverAllowance allowance
    ) {
        DriverAllowance updated = driverAllowanceService.updateAllowance(id, allowance);
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rule updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAllowance(@PathVariable UUID id) {
        driverAllowanceService.deleteAllowance(id);
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rule deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<DriverAllowance>> toggleStatus(@PathVariable UUID id) {
        DriverAllowance updated = driverAllowanceService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Driver allowance rule status updated", updated));
    }

    @GetMapping("/resolve")
    public ResponseEntity<ApiResponse<DriverAllowance>> resolveAllowance(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String time
    ) {
        DriverAllowance resolved = driverAllowanceService.resolveAllowance(model, city, state, time);
        return ResponseEntity.ok(ApiResponse.success("Resolved driver allowance", resolved));
    }
}

package com.grabrentals.admin.controller;

import com.grabrentals.admin.dto.CreateFleetUserRequest;
import com.grabrentals.admin.dto.CreateOperationsUserRequest;
import com.grabrentals.admin.service.AdminService;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.user.dto.UpdateUserStatusRequest;
import com.grabrentals.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final com.grabrentals.audit.service.AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard", Map.of("role", "ADMIN")));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserResponse updated = adminService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @RequestMapping(value = "/users/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody com.grabrentals.admin.dto.UpdateUserRequest request
    ) {
        UserResponse updated = adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID id
    ) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PostMapping("/users/operations")
    public ResponseEntity<ApiResponse<UserResponse>> createOperationsUser(
            @Valid @RequestBody CreateOperationsUserRequest request
    ) {
        UserResponse created = adminService.createOperationsUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Operations user created successfully", created));
    }

    @PostMapping({"/users/vendor", "/users/fleet"})
    public ResponseEntity<ApiResponse<UserResponse>> createVendorUser(
            @Valid @RequestBody com.grabrentals.admin.dto.CreateVendorUserRequest request
    ) {
        UserResponse created = adminService.createVendorUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor user created successfully", created));
    }

    @PostMapping("/users/customer")
    public ResponseEntity<ApiResponse<UserResponse>> createCustomerUser(
            @Valid @RequestBody com.grabrentals.auth.dto.CustomerRegisterRequest request
    ) {
        UserResponse created = adminService.createCustomerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer user created successfully", created));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<com.grabrentals.audit.dto.AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String category
    ) {
        List<com.grabrentals.audit.dto.AuditLogResponse> logs = auditLogService.getAuditLogs(category);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
    }

    @PostMapping("/audit-logs")
    public ResponseEntity<ApiResponse<com.grabrentals.audit.dto.AuditLogResponse>> createAuditLog(
            @Valid @RequestBody com.grabrentals.audit.dto.CreateAuditLogRequest request
    ) {
        com.grabrentals.audit.dto.AuditLogResponse created = auditLogService.logEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Audit log recorded successfully", created));
    }
}

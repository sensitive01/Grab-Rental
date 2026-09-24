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

    @PostMapping("/users/operations")
    public ResponseEntity<ApiResponse<UserResponse>> createOperationsUser(
            @Valid @RequestBody CreateOperationsUserRequest request
    ) {
        UserResponse created = adminService.createOperationsUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Operations user created successfully", created));
    }

    @PostMapping("/users/fleet")
    public ResponseEntity<ApiResponse<UserResponse>> createFleetUser(
            @Valid @RequestBody CreateFleetUserRequest request
    ) {
        UserResponse created = adminService.createFleetUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fleet user created successfully", created));
    }
}

package com.example.rental.customer.controller;

import com.example.rental.common.response.ApiResponse;
import com.example.rental.customer.dto.CustomerProfileUpdateRequest;
import com.example.rental.customer.service.CustomerService;
import com.example.rental.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Customer dashboard", Map.of("role", "CUSTOMER")));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<com.example.rental.customer.dto.CustomerProfileResponse>> getProfile() {
        com.example.rental.customer.dto.CustomerProfileResponse response = customerService.getProfile();
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<com.example.rental.customer.dto.CustomerProfileResponse>> updateProfile(@Valid @RequestBody CustomerProfileUpdateRequest request) {
        com.example.rental.customer.dto.CustomerProfileResponse response = customerService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}

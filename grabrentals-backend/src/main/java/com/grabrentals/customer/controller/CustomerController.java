package com.grabrentals.customer.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.CustomerProfileUpdateRequest;
import com.grabrentals.customer.service.CustomerService;
import com.grabrentals.user.dto.UserResponse;
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
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.CustomerProfileResponse>> getProfile() {
        com.grabrentals.customer.dto.CustomerProfileResponse response = customerService.getProfile();
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.CustomerProfileResponse>> updateProfile(@Valid @RequestBody CustomerProfileUpdateRequest request) {
        com.grabrentals.customer.dto.CustomerProfileResponse response = customerService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/pin/set")
    public ResponseEntity<ApiResponse<Void>> setPin(@Valid @RequestBody com.grabrentals.customer.dto.SetPinRequest request) {
        customerService.setPin(request);
        return ResponseEntity.ok(ApiResponse.success("6-digit PIN set successfully", null));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<java.util.List<com.grabrentals.customer.dto.CustomerAddressResponse>>> getAddresses() {
        java.util.List<com.grabrentals.customer.dto.CustomerAddressResponse> responses = customerService.getAddresses();
        return ResponseEntity.ok(ApiResponse.success("Customer saved addresses retrieved successfully", responses));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.CustomerAddressResponse>> addAddress(
            @Valid @RequestBody com.grabrentals.customer.dto.CustomerAddressRequest request) {
        com.grabrentals.customer.dto.CustomerAddressResponse response = customerService.addAddress(request);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.CustomerAddressResponse>> updateAddress(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody com.grabrentals.customer.dto.CustomerAddressRequest request) {
        com.grabrentals.customer.dto.CustomerAddressResponse response = customerService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable java.util.UUID id) {
        customerService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<ApiResponse<com.grabrentals.customer.dto.CustomerAddressResponse>> setDefaultAddress(@PathVariable java.util.UUID id) {
        com.grabrentals.customer.dto.CustomerAddressResponse response = customerService.setDefaultAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", response));
    }
}

package com.grabrentals.auth.controller;

import com.grabrentals.auth.dto.CustomerRegisterRequest;
import com.grabrentals.auth.dto.FleetRegisterRequest;
import com.grabrentals.auth.dto.LoginRequest;
import com.grabrentals.auth.dto.LoginResponse;
import com.grabrentals.auth.service.AuthService;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<UserResponse>> registerCustomer(@Valid @RequestBody CustomerRegisterRequest request) {
        UserResponse response = authService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registered successfully", response));
    }

    @PostMapping("/register/fleet")
    public ResponseEntity<ApiResponse<UserResponse>> registerFleet(@Valid @RequestBody FleetRegisterRequest request) {
        UserResponse response = authService.registerFleet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fleet registered successfully. Account is pending admin approval.", response));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<ApiResponse<com.grabrentals.auth.dto.SendOtpResponse>> sendOtp(@Valid @RequestBody com.grabrentals.auth.dto.SendOtpRequest request) {
        com.grabrentals.auth.dto.SendOtpResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyOtp(@Valid @RequestBody com.grabrentals.auth.dto.VerifyOtpRequest request) {
        LoginResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved successfully", response));
    }
}

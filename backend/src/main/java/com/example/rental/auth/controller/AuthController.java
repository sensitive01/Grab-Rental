package com.example.rental.auth.controller;

import com.example.rental.auth.dto.CustomerRegisterRequest;
import com.example.rental.auth.dto.FleetRegisterRequest;
import com.example.rental.auth.dto.LoginRequest;
import com.example.rental.auth.dto.LoginResponse;
import com.example.rental.auth.service.AuthService;
import com.example.rental.common.response.ApiResponse;
import com.example.rental.user.dto.UserResponse;
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
    public ResponseEntity<ApiResponse<com.example.rental.auth.dto.SendOtpResponse>> sendOtp(@Valid @RequestBody com.example.rental.auth.dto.SendOtpRequest request) {
        com.example.rental.auth.dto.SendOtpResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyOtp(@Valid @RequestBody com.example.rental.auth.dto.VerifyOtpRequest request) {
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

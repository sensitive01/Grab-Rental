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

    @PostMapping({"/register/vendor", "/register/fleet"})
    public ResponseEntity<ApiResponse<UserResponse>> registerVendor(@Valid @RequestBody com.grabrentals.auth.dto.VendorRegisterRequest request) {
        UserResponse response = authService.registerVendor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor registered successfully. Account is pending admin approval.", response));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<ApiResponse<com.grabrentals.auth.dto.SendOtpResponse>> sendOtp(@Valid @RequestBody com.grabrentals.auth.dto.SendOtpRequest request) {
        com.grabrentals.auth.dto.SendOtpResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyOtp(
            @Valid @RequestBody com.grabrentals.auth.dto.VerifyOtpRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.verifyOtp(request);
        attachAuthCookie(response, loginResponse.getAccessToken());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", loginResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.login(request);
        attachAuthCookie(response, loginResponse.getAccessToken());
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.grabrentals.auth.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now log in with your new password.", null));
    }

    @PostMapping("/reset-password/generate-token")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> generateResetToken(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        java.util.Map<String, Object> data = authService.generateResetPasswordToken(email);
        return ResponseEntity.ok(ApiResponse.success("Reset token generated successfully", data));
    }

    @PostMapping("/reset-password/send-otp")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> sendResetOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        java.util.Map<String, Object> data = authService.sendResetPasswordOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code sent successfully", data));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response
    ) {
        authService.logout(request);
        clearAuthCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Successfully logged out and session revoked", null));
    }

    private void attachAuthCookie(jakarta.servlet.http.HttpServletResponse response, String token) {
        if (token == null) return;
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("grab_access_token", token)
                .httpOnly(true)
                .secure(false) // Localhost compatible; automatically secure in HTTPS proxy
                .path("/")
                .maxAge(java.time.Duration.ofHours(24))
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearAuthCookie(jakarta.servlet.http.HttpServletResponse response) {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("grab_access_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }
}


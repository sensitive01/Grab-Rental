package com.grabrentals.auth.service;

import com.grabrentals.auth.dto.*;
import com.grabrentals.common.exception.*;
import com.grabrentals.security.JwtService;
import com.grabrentals.user.dto.UserResponse;
import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grabrentals.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final com.grabrentals.customer.repository.CustomerProfileRepository customerProfileRepository;
    private final com.grabrentals.vendor.repository.VendorProfileRepository vendorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final TokenBlacklistService tokenBlacklistService;
    private final com.grabrentals.audit.service.AuditLogService auditLogService;

    private static final int MAX_FAILED_LOGINS = 5;
    private static final int LOGIN_LOCKOUT_MINUTES = 15;

    private static class LoginAttemptRecord {
        int failedAttempts = 0;
        Instant lockedUntil = Instant.EPOCH;

        boolean isLocked() {
            return Instant.now().isBefore(lockedUntil);
        }

        long remainingLockoutMinutes() {
            return Math.max(1, (Duration.between(Instant.now(), lockedUntil).getSeconds() / 60) + 1);
        }

        void recordFailure() {
            failedAttempts++;
            if (failedAttempts >= MAX_FAILED_LOGINS) {
                lockedUntil = Instant.now().plus(Duration.ofMinutes(LOGIN_LOCKOUT_MINUTES));
            }
        }

        void reset() {
            failedAttempts = 0;
            lockedUntil = Instant.EPOCH;
        }
    }

    private final Map<String, LoginAttemptRecord> loginAttempts = new ConcurrentHashMap<>();

    @Transactional
    public SendOtpResponse sendOtp(SendOtpRequest request) {
        return otpService.generateAndSendOtp(request.getPhone());
    }

    @Transactional
    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.getPhone(), request.getOtp());

        String phone = otpService.normalizePhone(request.getPhone());

        // Find existing user or auto-provision a new Customer
        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            String digitsOnly = phone.replaceAll("[^0-9]", "");
            String placeholderEmail = digitsOnly + "@grabrentals.guest";

            User newUser = User.builder()
                    .name("Customer")
                    .phone(phone)
                    .email(placeholderEmail)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(Role.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            User saved = userRepository.save(newUser);

            com.grabrentals.customer.entity.CustomerProfile profile = com.grabrentals.customer.entity.CustomerProfile.builder()
                    .user(saved)
                    .fullName("Customer")
                    .build();
            customerProfileRepository.save(profile);

            return saved;
        });

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountBlockedException("Your account has been blocked. Please contact support.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AccountBlockedException("Your account is currently inactive.");
        }

        String token = jwtService.generateToken(user);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("LOGIN_SUCCESS")
                    .userId(user.getPhone())
                    .userName(user.getName())
                    .userRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER")
                    .status("SUCCESS")
                    .details("Customer authenticated via OTP verification")
                    .build());
        } catch (Exception ignored) {}

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(LoginResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }

    @Transactional
    public UserResponse registerCustomer(CustomerRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new EmailAlreadyExistsException("Email already in use: " + request.getEmail());
        }

        if (userRepository.existsByPhone(request.getPhone().trim())) {
            throw new IllegalArgumentException("Phone number already in use: " + request.getPhone());
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        com.grabrentals.customer.entity.CustomerProfile profile = com.grabrentals.customer.entity.CustomerProfile.builder()
                .user(savedUser)
                .fullName(savedUser.getName())
                .build();
        customerProfileRepository.save(profile);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_PROVISIONED")
                    .userId(savedUser.getEmail())
                    .userName(savedUser.getName())
                    .userRole(Role.CUSTOMER.name())
                    .status("SUCCESS")
                    .details("New customer self-registered account")
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse registerVendor(com.grabrentals.auth.dto.VendorRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new EmailAlreadyExistsException("Email already in use: " + request.getEmail());
        }

        if (userRepository.existsByPhone(request.getPhone().trim())) {
            throw new IllegalArgumentException("Phone number already in use: " + request.getPhone());
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .businessName(request.getBusinessName().trim())
                .role(Role.FLEET)
                .status(UserStatus.PENDING) // Pending approval by admin
                .build();

        User savedUser = userRepository.save(user);

        com.grabrentals.vendor.entity.VendorProfile vendorProfile = com.grabrentals.vendor.entity.VendorProfile.builder()
                .user(savedUser)
                .companyName(request.getBusinessName().trim())
                .contactPerson(request.getName().trim())
                .build();
        vendorProfileRepository.save(vendorProfile);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_PROVISIONED")
                    .userId(savedUser.getEmail())
                    .userName(savedUser.getName())
                    .userRole(Role.FLEET.name())
                    .status("WARNING")
                    .details("Vendor registered company account (PENDING admin review): " + request.getBusinessName())
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse registerFleet(FleetRegisterRequest request) {
        return registerVendor(request);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        LoginAttemptRecord attempt = loginAttempts.computeIfAbsent(normalizedEmail, k -> new LoginAttemptRecord());

        if (attempt.isLocked()) {
            throw new RateLimitExceededException(
                "Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in " + attempt.remainingLockoutMinutes() + " minutes."
            );
        }

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            attempt.recordFailure();
            int remaining = Math.max(0, MAX_FAILED_LOGINS - attempt.failedAttempts);

            try {
                auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                        .category("SECURITY")
                        .event(attempt.isLocked() ? "ACCOUNT_LOCKED" : "LOGIN_FAILED")
                        .userId(normalizedEmail)
                        .userName(user != null ? user.getName() : "Unknown Identity")
                        .userRole(user != null && user.getRole() != null ? user.getRole().name() : "UNKNOWN")
                        .status("FAILED")
                        .details(attempt.isLocked() 
                            ? "Account temporarily locked for 15 minutes after 5 failed password attempts" 
                            : "Failed login attempt with invalid credentials (" + remaining + " attempts remaining)")
                        .build());
            } catch (Exception ignored) {}

            if (attempt.isLocked()) {
                throw new RateLimitExceededException(
                    "Account is temporarily locked for 15 minutes due to 5 consecutive failed login attempts."
                );
            }

            throw new InvalidCredentialsException("Invalid credentials. " + remaining + " attempt(s) remaining.");
        }

        // Reset failed login counter on successful password validation
        attempt.reset();

        if (user.getStatus() == UserStatus.BLOCKED) {
            try {
                auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                        .category("SECURITY")
                        .event("LOGIN_FAILED")
                        .userId(user.getEmail())
                        .userName(user.getName())
                        .userRole(user.getRole() != null ? user.getRole().name() : "USER")
                        .status("FAILED")
                        .details("Blocked account attempted to log in")
                        .build());
            } catch (Exception ignored) {}
            throw new AccountBlockedException("Your account has been blocked. Please contact support.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AccountBlockedException("Your account is currently inactive.");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccountPendingException("Your account is pending administrator approval. Access will be granted once reviewed.");
        }

        String token = jwtService.generateToken(user);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("LOGIN_SUCCESS")
                    .userId(user.getEmail())
                    .userName(user.getName())
                    .userRole(user.getRole() != null ? user.getRole().name() : "USER")
                    .status("SUCCESS")
                    .details("User successfully authenticated session via credentials")
                    .build());
        } catch (Exception ignored) {}

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(LoginResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String principal = authentication.getName();
        User user = userRepository.findByEmail(principal)
                .or(() -> userRepository.findByPhone(principal))
                .orElseThrow(() -> new UserNotFoundException("User not found with identifier: " + principal));

        return UserResponse.fromEntity(user);
    }

    public void logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                Date expiration = jwtService.extractExpiration(jwt);
                tokenBlacklistService.blacklistToken(jwt, expiration.toInstant());
            } catch (Exception e) {
                tokenBlacklistService.blacklistToken(jwt, Instant.now().plus(Duration.ofHours(24)));
            }

            try {
                String email = jwtService.extractUsername(jwt);
                auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                        .category("SECURITY")
                        .event("LOGOUT")
                        .userId(email != null ? email : "Anonymous")
                        .userName(email != null ? email : "User")
                        .userRole("USER")
                        .status("SUCCESS")
                        .details("User session terminated and JWT token revoked in blacklist")
                        .build());
            } catch (Exception ignored) {}
        }
    }
}

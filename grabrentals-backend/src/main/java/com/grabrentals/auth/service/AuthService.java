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
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import com.grabrentals.security.CustomUserDetailsService;

@Slf4j
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
    private final CustomUserDetailsService customUserDetailsService;
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

    public java.util.Optional<User> findUserByPhoneFlexible(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) return java.util.Optional.empty();
        String normalized = otpService.normalizePhone(rawPhone);
        String digitsOnly = rawPhone.replaceAll("[^0-9]", "");
        if (digitsOnly.length() > 10) {
            digitsOnly = digitsOnly.substring(digitsOnly.length() - 10);
        }

        java.util.Optional<User> user = userRepository.findByPhone(normalized);
        if (user.isPresent()) return user;

        if (!digitsOnly.isEmpty()) {
            user = userRepository.findByPhone(digitsOnly);
            if (user.isPresent()) return user;

            user = userRepository.findByPhone("+91" + digitsOnly);
            if (user.isPresent()) return user;
        }

        return java.util.Optional.empty();
    }

    @Transactional
    public SendOtpResponse sendOtp(SendOtpRequest request) {
        java.util.Optional<User> existingUser = findUserByPhoneFlexible(request.getPhone());
        boolean userExists = existingUser.isPresent();

        if ("REGISTRATION".equalsIgnoreCase(request.getPurpose()) && userExists) {
            throw new IllegalArgumentException("An account is already registered with this mobile number. Please log in to continue.");
        }

        if ("LOGIN".equalsIgnoreCase(request.getPurpose()) && !userExists) {
            throw new IllegalArgumentException("No partner account found with this mobile number. Please register your fleet first.");
        }

        SendOtpResponse response = otpService.generateAndSendOtp(request.getPhone());
        response.setUserExists(userExists);
        existingUser.ifPresent(u -> response.setExistingRole(u.getRole() != null ? u.getRole().name() : null));
        return response;
    }

    @Transactional
    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.getPhone(), request.getOtp());

        if ("LOGIN".equalsIgnoreCase(request.getPurpose())) {
            java.util.Optional<User> existing = findUserByPhoneFlexible(request.getPhone());
            if (existing.isEmpty()) {
                throw new IllegalArgumentException("No partner account found with this mobile number. Please register your fleet first.");
            }
        }

        String phone = otpService.normalizePhone(request.getPhone());

        boolean isVendorRequest = request.getRole() != null &&
                (request.getRole().equalsIgnoreCase("FLEET") || request.getRole().equalsIgnoreCase("VENDOR"));

        java.util.concurrent.atomic.AtomicBoolean isNew = new java.util.concurrent.atomic.AtomicBoolean(false);

        // Find existing user or auto-provision a new Vendor Partner or Customer
        User user = findUserByPhoneFlexible(request.getPhone()).orElseGet(() -> {
            isNew.set(true);
            String digitsOnly = phone.replaceAll("[^0-9]", "");
            String placeholderEmail = digitsOnly + (isVendorRequest ? "@vendor.grabrentals.in" : "@grabrentals.guest");
            String displayName = request.getName() != null && !request.getName().isBlank()
                    ? request.getName().trim()
                    : (isVendorRequest ? "Vendor Partner" : "Customer");

            User newUser = User.builder()
                    .name(displayName)
                    .phone(phone)
                    .email(placeholderEmail)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(isVendorRequest ? Role.FLEET : Role.CUSTOMER)
                    .businessName(request.getBusinessName() != null ? request.getBusinessName().trim() : null)
                    .status(isVendorRequest ? UserStatus.PENDING : UserStatus.ACTIVE)
                    .build();
            User saved = userRepository.save(newUser);

            if (isVendorRequest) {
                int num = Math.abs(saved.getId().hashCode() % 900000) + 100000;
                com.grabrentals.vendor.entity.VendorProfile vendorProfile = com.grabrentals.vendor.entity.VendorProfile.builder()
                        .user(saved)
                        .vendorIdCode("GR-VND-" + num)
                        .companyName(request.getBusinessName() != null && !request.getBusinessName().isBlank()
                                ? request.getBusinessName().trim()
                                : displayName)
                        .contactPerson(displayName)
                        .fleetSize(0)
                        .build();
                vendorProfileRepository.save(vendorProfile);
            } else {
                com.grabrentals.customer.entity.CustomerProfile profile = com.grabrentals.customer.entity.CustomerProfile.builder()
                        .user(saved)
                        .fullName(displayName)
                        .build();
                customerProfileRepository.save(profile);
            }

            return saved;
        });

        // If vendor request and user lacks vendor profile, ensure one is created
        if (isVendorRequest) {
            if (user.getRole() == Role.CUSTOMER) {
                user.setRole(Role.FLEET);
                userRepository.save(user);
            }
            if (!vendorProfileRepository.existsByUserId(user.getId())) {
                int num = Math.abs(user.getId().hashCode() % 900000) + 100000;
                com.grabrentals.vendor.entity.VendorProfile vendorProfile = com.grabrentals.vendor.entity.VendorProfile.builder()
                        .user(user)
                        .vendorIdCode("GR-VND-" + num)
                        .companyName(request.getBusinessName() != null && !request.getBusinessName().isBlank()
                                ? request.getBusinessName().trim()
                                : user.getName())
                        .contactPerson(user.getName())
                        .fleetSize(0)
                        .build();
                vendorProfileRepository.save(vendorProfile);
            }
        }

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
        } catch (Throwable ignored) {}

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(LoginResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .build())
                .isNewUser(isNew.get())
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
        } catch (Throwable ignored) {}

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
        } catch (Throwable ignored) {}

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
            } catch (Throwable ignored) {}

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
            } catch (Throwable ignored) {}
            throw new AccountBlockedException("Your account has been blocked. Please contact support.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AccountBlockedException("Your account is currently inactive.");
        }

        // PENDING accounts can log in to view their registered fleet & profile details, but bookings remain restricted until approved.
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
        } catch (Throwable ignored) {}

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(LoginResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .status(user.getStatus())
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
            } catch (Throwable ignored) {}
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateResetPasswordToken(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Email or phone is required");
        }
        User user = userRepository.findByEmail(identifier.trim())
                .or(() -> findUserByPhoneFlexible(identifier.trim()))
                .orElseThrow(() -> new IllegalArgumentException("No partner account found with identifier: " + identifier));

        String token = jwtService.generatePasswordResetToken(user);
        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("email", user.getEmail());
        res.put("phone", user.getPhone());
        res.put("expiresInSeconds", 86400);
        return res;
    }

    @Transactional
    public Map<String, Object> sendResetPasswordOtp(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Email or phone is required");
        }
        User user = userRepository.findByEmail(identifier.trim())
                .or(() -> findUserByPhoneFlexible(identifier.trim()))
                .orElseThrow(() -> new IllegalArgumentException("No partner account found with identifier: " + identifier));

        if (user.getPhone() == null || user.getPhone().isBlank()) {
            throw new IllegalArgumentException("No registered mobile number on file for account: " + identifier);
        }

        SendOtpResponse otpResp = otpService.generateAndSendOtp(user.getPhone());
        String cleanPhone = user.getPhone().replaceAll("[^0-9]", "");
        String maskedPhone = cleanPhone.length() >= 4 
                ? "••••••" + cleanPhone.substring(cleanPhone.length() - 4) 
                : cleanPhone;

        Map<String, Object> res = new HashMap<>();
        res.put("phoneMasked", maskedPhone);
        res.put("devOtp", otpResp.getDevOtp());
        res.put("expiresInSeconds", otpResp.getExpiresInSeconds());
        return res;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        String newPassword = request.getNewPassword() != null ? request.getNewPassword().trim() : "";

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }

        User user = null;
        boolean verified = false;

        // 1. Try to verify via Signed Token
        if (request.getToken() != null && !request.getToken().isBlank()) {
            try {
                String token = request.getToken().trim();
                String tokenSubject = jwtService.extractUsername(token);
                if (tokenSubject != null && !tokenSubject.isBlank()) {
                    user = userRepository.findByEmail(tokenSubject)
                            .or(() -> findUserByPhoneFlexible(tokenSubject))
                            .orElse(null);
                    if (user != null) {
                        verified = true;
                    }
                }
            } catch (Exception e) {
                log.warn("Invalid or expired reset token provided: {}", e.getMessage());
            }
        }

        // 2. If not verified via token, try to verify via OTP
        if (!verified) {
            if (user == null && !identifier.isBlank()) {
                user = userRepository.findByEmail(identifier)
                        .or(() -> findUserByPhoneFlexible(identifier))
                        .orElseThrow(() -> new IllegalArgumentException("No account found with identifier: " + identifier));
            }

            if (user == null) {
                throw new IllegalArgumentException("Please provide a valid email or mobile number.");
            }

            if (request.getOtp() == null || request.getOtp().isBlank()) {
                throw new IllegalArgumentException("Security verification required: Please open the secure link sent to your email or enter the 6-digit verification code sent to your registered phone.");
            }

            String phoneToVerify = user.getPhone() != null ? user.getPhone() : identifier;
            otpService.verifyOtp(phoneToVerify, request.getOtp().trim());
            verified = true;
        }

        if (!verified || user == null) {
            throw new IllegalArgumentException("Verification failed. Please request a new reset link or enter a valid verification code.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordSet(true);
        userRepository.save(user);

        customUserDetailsService.evictUser(user.getEmail());
        customUserDetailsService.evictUser("id:" + user.getId());

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("PASSWORD_RESET")
                    .userId(user.getEmail() != null ? user.getEmail() : user.getId().toString())
                    .userName(user.getName() != null ? user.getName() : "User")
                    .userRole(user.getRole() != null ? user.getRole().name() : "USER")
                    .status("SUCCESS")
                    .details("Password reset completed successfully via verified token/OTP")
                    .build());
        } catch (Throwable ignored) {}
    }
}

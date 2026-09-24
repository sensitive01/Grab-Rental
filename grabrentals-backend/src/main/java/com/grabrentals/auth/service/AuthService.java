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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final com.grabrentals.customer.repository.CustomerProfileRepository customerProfileRepository;
    private final com.grabrentals.fleet.repository.FleetProfileRepository fleetProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

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

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public UserResponse registerFleet(FleetRegisterRequest request) {
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

        com.grabrentals.fleet.entity.FleetProfile fleetProfile = com.grabrentals.fleet.entity.FleetProfile.builder()
                .user(savedUser)
                .companyName(request.getBusinessName().trim())
                .contactPerson(request.getName().trim())
                .build();
        fleetProfileRepository.save(fleetProfile);

        return UserResponse.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountBlockedException("Your account has been blocked. Please contact support.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new AccountBlockedException("Your account is currently inactive.");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccountPendingException("Your account is pending administrator approval. Access will be granted once reviewed.");
        }

        String token = jwtService.generateToken(user);

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
}

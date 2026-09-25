package com.grabrentals.admin.service;

import com.grabrentals.admin.dto.CreateFleetUserRequest;
import com.grabrentals.admin.dto.CreateOperationsUserRequest;
import com.grabrentals.common.exception.EmailAlreadyExistsException;
import com.grabrentals.user.dto.UserResponse;
import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import com.grabrentals.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final com.grabrentals.fleet.repository.FleetProfileRepository fleetProfileRepository;
    private final com.grabrentals.fleet.repository.VehicleRepository vehicleRepository;
    private final com.grabrentals.fleet.repository.DriverRepository driverRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final com.grabrentals.security.CustomUserDetailsService userDetailsService;
    private final com.grabrentals.audit.service.AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return userService.getUserById(id);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserStatus(UUID id, UserStatus newStatus) {
        UserResponse response = userService.updateUserStatus(id, newStatus);
        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_STATUS_CHANGE")
                    .userId(response.getEmail())
                    .userName(response.getName())
                    .userRole(response.getRole() != null ? response.getRole().name() : "USER")
                    .status(newStatus == UserStatus.BLOCKED ? "WARNING" : "SUCCESS")
                    .details("Account status changed to " + newStatus)
                    .build());
        } catch (Exception ignored) {}
        return response;
    }

    @Transactional
    public UserResponse updateUser(UUID id, com.grabrentals.admin.dto.UpdateUserRequest request) {
        User user = userService.getUserEntityById(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank() && !request.getPhone().equals(user.getPhone())) {
            String newPhone = request.getPhone().trim();
            userRepository.findByPhone(newPhone).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Phone number already in use by another user: " + newPhone);
                }
            });
            user.setPhone(newPhone);
        }

        if (request.getBusinessName() != null) {
            user.setBusinessName(request.getBusinessName().trim());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 8) {
                throw new IllegalArgumentException("Password must be at least 8 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.FLEET || saved.getRole() == Role.VENDOR) {
            fleetProfileRepository.findByUserId(saved.getId()).ifPresent(fp -> {
                if (saved.getBusinessName() != null) {
                    fp.setCompanyName(saved.getBusinessName());
                }
                fp.setContactPerson(saved.getName());
                fleetProfileRepository.save(fp);
            });
        }

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_UPDATED")
                    .userId(saved.getEmail())
                    .userName(saved.getName())
                    .userRole(saved.getRole() != null ? saved.getRole().name() : "USER")
                    .status("SUCCESS")
                    .details("Admin updated user profile for " + saved.getEmail())
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userService.getUserEntityById(id);

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("System administrator accounts cannot be deleted");
        }

        // 1. Delete associated drivers if any
        List<com.grabrentals.fleet.entity.Driver> drivers = driverRepository.findByUserIdOrderByCreatedAtDesc(id);
        if (drivers != null && !drivers.isEmpty()) {
            driverRepository.deleteAll(drivers);
        }

        // 2. Delete associated vehicles if any
        List<com.grabrentals.fleet.entity.Vehicle> vehicles = vehicleRepository.findByUserIdOrderByCreatedAtDesc(id);
        if (vehicles != null && !vehicles.isEmpty()) {
            vehicleRepository.deleteAll(vehicles);
        }

        // 3. Delete fleet profile if any
        fleetProfileRepository.findByUserId(id).ifPresent(fleetProfileRepository::delete);

        // 4. Delete user entity
        userRepository.delete(user);

        // 5. Evict security cache
        try {
            userDetailsService.evictUser(user.getEmail());
            userDetailsService.evictUser(user.getPhone());
        } catch (Exception ignored) {}

        // 6. Record audit log
        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_DELETED")
                    .userId(user.getEmail())
                    .userName(user.getName())
                    .userRole(user.getRole() != null ? user.getRole().name() : "USER")
                    .status("WARNING")
                    .details("Admin permanently deleted user account: " + user.getEmail())
                    .build());
        } catch (Exception ignored) {}
    }

    @Transactional
    public UserResponse createOperationsUser(CreateOperationsUserRequest request) {
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
                .role(Role.OPERATIONS)
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_PROVISIONED")
                    .userId(saved.getEmail())
                    .userName(saved.getName())
                    .userRole(Role.OPERATIONS.name())
                    .status("SUCCESS")
                    .details("Admin provisioned new operations staff account: " + saved.getEmail())
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse createVendorUser(com.grabrentals.admin.dto.CreateVendorUserRequest request) {
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
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);

        com.grabrentals.fleet.entity.FleetProfile fleetProfile = com.grabrentals.fleet.entity.FleetProfile.builder()
                .user(saved)
                .companyName(request.getBusinessName().trim())
                .contactPerson(request.getName().trim())
                .build();
        fleetProfileRepository.save(fleetProfile);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_PROVISIONED")
                    .userId(saved.getEmail())
                    .userName(saved.getName())
                    .userRole("VENDOR")
                    .status("SUCCESS")
                    .details("Admin provisioned new vendor account (" + request.getBusinessName() + "): " + saved.getEmail())
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse createFleetUser(CreateFleetUserRequest request) {
        return createVendorUser(com.grabrentals.admin.dto.CreateVendorUserRequest.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(request.getPassword())
                .businessName(request.getBusinessName())
                .status(request.getStatus())
                .build());
    }

    @Transactional
    public UserResponse createCustomerUser(com.grabrentals.auth.dto.CustomerRegisterRequest request) {
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

        User saved = userRepository.save(user);

        try {
            auditLogService.logEvent(com.grabrentals.audit.dto.CreateAuditLogRequest.builder()
                    .category("SECURITY")
                    .event("USER_PROVISIONED")
                    .userId(saved.getEmail())
                    .userName(saved.getName())
                    .userRole(Role.CUSTOMER.name())
                    .status("SUCCESS")
                    .details("Admin provisioned customer account: " + saved.getEmail())
                    .build());
        } catch (Exception ignored) {}

        return UserResponse.fromEntity(saved);
    }
}

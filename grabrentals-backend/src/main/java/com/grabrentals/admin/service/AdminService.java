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
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

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
        return userService.updateUserStatus(id, newStatus);
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
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse createFleetUser(CreateFleetUserRequest request) {
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

        return UserResponse.fromEntity(saved);
    }
}

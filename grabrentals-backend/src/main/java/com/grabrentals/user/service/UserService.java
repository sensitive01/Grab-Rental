package com.grabrentals.user.service;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.user.dto.UserResponse;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final com.grabrentals.security.CustomUserDetailsService userDetailsService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = getUserEntityById(id);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserStatus(UUID id, UserStatus newStatus) {
        User user = getUserEntityById(id);
        user.setStatus(newStatus);
        User updated = userRepository.save(user);
        userDetailsService.evictUser(updated.getEmail());
        userDetailsService.evictUser(updated.getPhone());
        return UserResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public User getUserEntityById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
}

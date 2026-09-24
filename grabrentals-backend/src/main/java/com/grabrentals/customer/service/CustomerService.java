package com.grabrentals.customer.service;

import com.grabrentals.common.exception.EmailAlreadyExistsException;
import com.grabrentals.common.exception.UnauthorizedException;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.customer.dto.CustomerProfileResponse;
import com.grabrentals.customer.dto.CustomerProfileUpdateRequest;
import com.grabrentals.customer.entity.CustomerProfile;
import com.grabrentals.customer.repository.CustomerProfileRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile() {
        User user = getAuthenticatedUser();
        CustomerProfile profile = customerProfileRepository.findByUser(user)
                .orElse(null);
        return CustomerProfileResponse.of(user, profile);
    }

    @Transactional
    public CustomerProfileResponse updateProfile(CustomerProfileUpdateRequest request) {
        User user = getAuthenticatedUser();

        // Update email on core user if provided
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().toLowerCase().trim();
            userRepository.findByEmail(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new EmailAlreadyExistsException("Email is already in use by another account: " + newEmail);
                }
            });
            user.setEmail(newEmail);
        }

        // Update primary name on core user if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        userRepository.save(user);

        // Update or create dedicated CustomerProfile
        CustomerProfile profile = customerProfileRepository.findByUser(user)
                .orElseGet(() -> CustomerProfile.builder()
                        .user(user)
                        .fullName(user.getName())
                        .build());

        if (request.getName() != null && !request.getName().isBlank()) {
            profile.setFullName(request.getName().trim());
        }

        if (request.getAlternatePhone() != null) {
            profile.setAlternatePhone(request.getAlternatePhone().trim());
        }

        if (request.getCity() != null) {
            profile.setCity(request.getCity().trim());
        }

        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress().trim());
        }

        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        return CustomerProfileResponse.of(user, savedProfile);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String principal = authentication.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByPhone(principal))
                .orElseThrow(() -> new UserNotFoundException("User not found: " + principal));
    }
}

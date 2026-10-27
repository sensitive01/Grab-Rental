package com.grabrentals.customer.service;

import com.grabrentals.common.exception.EmailAlreadyExistsException;
import com.grabrentals.common.exception.UnauthorizedException;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.customer.dto.CustomerProfileResponse;
import com.grabrentals.customer.dto.CustomerProfileUpdateRequest;
import com.grabrentals.customer.dto.SetPinRequest;
import com.grabrentals.customer.entity.CustomerProfile;
import com.grabrentals.customer.repository.CustomerProfileRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final com.grabrentals.customer.repository.CustomerAddressRepository customerAddressRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile() {
        User user = getAuthenticatedUser();
        CustomerProfile profile = customerProfileRepository.findByUser(user)
                .orElse(null);
        java.util.List<com.grabrentals.customer.dto.CustomerAddressResponse> addresses = customerAddressRepository
                .findByUserOrderByIsDefaultDescCreatedAtDesc(user)
                .stream()
                .map(com.grabrentals.customer.dto.CustomerAddressResponse::fromEntity)
                .toList();
        return CustomerProfileResponse.of(user, profile, addresses);
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

    @Transactional
    public void setPin(SetPinRequest request) {
        User user = getAuthenticatedUser();
        String pin = request.getPin() != null ? request.getPin().trim() : "";
        if (!pin.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException("PIN must be exactly 6 numeric digits.");
        }
        user.setPassword(passwordEncoder.encode(pin));
        user.setPasswordSet(true);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.grabrentals.customer.dto.CustomerAddressResponse> getAddresses() {
        User user = getAuthenticatedUser();
        return customerAddressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user)
                .stream()
                .map(com.grabrentals.customer.dto.CustomerAddressResponse::fromEntity)
                .toList();
    }

    @Transactional
    public com.grabrentals.customer.dto.CustomerAddressResponse addAddress(com.grabrentals.customer.dto.CustomerAddressRequest request) {
        User user = getAuthenticatedUser();
        java.util.List<com.grabrentals.customer.entity.CustomerAddress> existing = customerAddressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || existing.isEmpty();

        if (shouldBeDefault) {
            existing.forEach(addr -> {
                if (Boolean.TRUE.equals(addr.getIsDefault())) {
                    addr.setIsDefault(false);
                    customerAddressRepository.save(addr);
                }
            });
        }

        com.grabrentals.customer.entity.CustomerAddress address = com.grabrentals.customer.entity.CustomerAddress.builder()
                .user(user)
                .tag(request.getTag() != null ? request.getTag().trim() : "Other")
                .addressLine(request.getAddressLine() != null ? request.getAddressLine().trim() : "")
                .area(request.getArea() != null ? request.getArea().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .state(request.getState() != null ? request.getState().trim() : null)
                .pincode(request.getPincode() != null ? request.getPincode().trim() : null)
                .landmark(request.getLandmark() != null ? request.getLandmark().trim() : null)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(shouldBeDefault)
                .build();

        com.grabrentals.customer.entity.CustomerAddress saved = customerAddressRepository.save(address);

        // Keep CustomerProfile address in sync if this is the default
        if (shouldBeDefault) {
            syncDefaultAddressToProfile(user, saved);
        }

        return com.grabrentals.customer.dto.CustomerAddressResponse.fromEntity(saved);
    }

    @Transactional
    public com.grabrentals.customer.dto.CustomerAddressResponse updateAddress(java.util.UUID id, com.grabrentals.customer.dto.CustomerAddressRequest request) {
        User user = getAuthenticatedUser();
        com.grabrentals.customer.entity.CustomerAddress address = customerAddressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Address not found: " + id));

        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (shouldBeDefault && !Boolean.TRUE.equals(address.getIsDefault())) {
            customerAddressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user).forEach(other -> {
                if (Boolean.TRUE.equals(other.getIsDefault())) {
                    other.setIsDefault(false);
                    customerAddressRepository.save(other);
                }
            });
            address.setIsDefault(true);
        }

        if (request.getTag() != null && !request.getTag().isBlank()) {
            address.setTag(request.getTag().trim());
        }
        if (request.getAddressLine() != null && !request.getAddressLine().isBlank()) {
            address.setAddressLine(request.getAddressLine().trim());
        }
        if (request.getArea() != null) {
            address.setArea(request.getArea().trim());
        }
        if (request.getCity() != null) {
            address.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            address.setState(request.getState().trim());
        }
        if (request.getPincode() != null) {
            address.setPincode(request.getPincode().trim());
        }
        if (request.getLandmark() != null) {
            address.setLandmark(request.getLandmark().trim());
        }
        if (request.getLatitude() != null) {
            address.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            address.setLongitude(request.getLongitude());
        }

        com.grabrentals.customer.entity.CustomerAddress saved = customerAddressRepository.save(address);

        if (Boolean.TRUE.equals(saved.getIsDefault())) {
            syncDefaultAddressToProfile(user, saved);
        }

        return com.grabrentals.customer.dto.CustomerAddressResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteAddress(java.util.UUID id) {
        User user = getAuthenticatedUser();
        com.grabrentals.customer.entity.CustomerAddress address = customerAddressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Address not found: " + id));

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        customerAddressRepository.delete(address);

        if (wasDefault) {
            java.util.List<com.grabrentals.customer.entity.CustomerAddress> remaining = customerAddressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
            if (!remaining.isEmpty()) {
                com.grabrentals.customer.entity.CustomerAddress newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                customerAddressRepository.save(newDefault);
                syncDefaultAddressToProfile(user, newDefault);
            }
        }
    }

    @Transactional
    public com.grabrentals.customer.dto.CustomerAddressResponse setDefaultAddress(java.util.UUID id) {
        User user = getAuthenticatedUser();
        com.grabrentals.customer.entity.CustomerAddress target = customerAddressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Address not found: " + id));

        customerAddressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user).forEach(addr -> {
            addr.setIsDefault(addr.getId().equals(id));
            customerAddressRepository.save(addr);
        });

        target.setIsDefault(true);
        syncDefaultAddressToProfile(user, target);
        return com.grabrentals.customer.dto.CustomerAddressResponse.fromEntity(target);
    }

    private void syncDefaultAddressToProfile(User user, com.grabrentals.customer.entity.CustomerAddress defaultAddr) {
        CustomerProfile profile = customerProfileRepository.findByUser(user)
                .orElseGet(() -> CustomerProfile.builder().user(user).fullName(user.getName()).build());
        profile.setAddress(defaultAddr.getAddressLine());
        if (defaultAddr.getCity() != null && !defaultAddr.getCity().isBlank()) {
            profile.setCity(defaultAddr.getCity());
        }
        customerProfileRepository.save(profile);
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

package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.CustomerProfile;
import com.grabrentals.user.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerProfileResponse {

    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String alternatePhone;
    private String city;
    private String address;
    private java.util.List<CustomerAddressResponse> addresses;
    private Instant createdAt;
    private Instant updatedAt;

    public static CustomerProfileResponse of(User user, CustomerProfile profile) {
        return of(user, profile, null);
    }

    public static CustomerProfileResponse of(User user, CustomerProfile profile, java.util.List<CustomerAddressResponse> addresses) {
        String displayName = (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank())
                ? profile.getFullName()
                : (user.getName() != null && !user.getName().equals("Customer") ? user.getName() : "Customer");

        String displayEmail = (user.getEmail() != null && !user.getEmail().endsWith("@grabrentals.guest"))
                ? user.getEmail()
                : null;

        return CustomerProfileResponse.builder()
                .id(user.getId())
                .name(displayName)
                .phone(user.getPhone())
                .email(displayEmail)
                .alternatePhone(profile != null ? profile.getAlternatePhone() : null)
                .city(profile != null ? profile.getCity() : null)
                .address(profile != null ? profile.getAddress() : null)
                .addresses(addresses)
                .createdAt(user.getCreatedAt())
                .updatedAt(profile != null ? profile.getUpdatedAt() : user.getUpdatedAt())
                .build();
    }
}

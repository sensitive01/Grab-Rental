package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.CustomerAddress;
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
public class CustomerAddressResponse {

    private UUID id;
    private String tag;
    private String addressLine;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private Instant createdAt;

    public static CustomerAddressResponse fromEntity(CustomerAddress entity) {
        if (entity == null) return null;
        return CustomerAddressResponse.builder()
                .id(entity.getId())
                .tag(entity.getTag())
                .addressLine(entity.getAddressLine())
                .area(entity.getArea())
                .city(entity.getCity())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .landmark(entity.getLandmark())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .isDefault(Boolean.TRUE.equals(entity.getIsDefault()))
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

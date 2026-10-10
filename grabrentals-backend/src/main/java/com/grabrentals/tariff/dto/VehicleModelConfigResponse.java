package com.grabrentals.tariff.dto;

import com.grabrentals.tariff.entity.VehicleModelConfig;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleModelConfigResponse {

    private UUID id;
    private String category;
    private String modelName;
    private String seatingCapacity;
    private String fuelType;
    private String commonPhotoUrl;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static VehicleModelConfigResponse fromEntity(VehicleModelConfig entity) {
        if (entity == null) return null;
        return VehicleModelConfigResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .modelName(entity.getModelName())
                .seatingCapacity(entity.getSeatingCapacity())
                .fuelType(entity.getFuelType())
                .commonPhotoUrl(entity.getCommonPhotoUrl())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

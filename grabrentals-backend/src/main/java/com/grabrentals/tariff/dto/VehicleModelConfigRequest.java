package com.grabrentals.tariff.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleModelConfigRequest {

    private UUID id;

    @NotBlank(message = "Vehicle category is required")
    private String category;

    @NotBlank(message = "Model name is required")
    private String modelName;

    @NotBlank(message = "Seating capacity is required")
    private String seatingCapacity;

    private String fuelType;

    private String commonPhotoUrl;

    @Builder.Default
    private Boolean active = true;
}

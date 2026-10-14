package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "vehicle_category_presets",
    indexes = {
        @Index(name = "idx_vcp_cat_model", columnList = "category, model_name")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCategoryPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "model_name", nullable = false, length = 150)
    private String modelName;

    @Column(name = "seating_capacity", length = 50)
    private String seatingCapacity;

    @Column(name = "fuel_type", length = 50)
    private String fuelType;
}

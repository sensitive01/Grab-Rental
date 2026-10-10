package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "vehicle_model_configs",
    indexes = {
        @Index(name = "idx_vmc_cat_model_seat", columnList = "category, model_name, seating_capacity")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VehicleModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "model_name", nullable = false, length = 150)
    private String modelName;

    @Column(name = "seating_capacity", nullable = false, length = 50)
    private String seatingCapacity;

    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "common_photo_url", length = 1000)
    private String commonPhotoUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

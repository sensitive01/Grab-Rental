package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "vehicle_tariffs",
    indexes = {
        @Index(name = "idx_vt_cat_model_seat", columnList = "category, model_name, seating_capacity"),
        @Index(name = "idx_vt_dates", columnList = "is_seasonal, start_date, end_date")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VehicleTariff {

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

    @Column(name = "is_seasonal", nullable = false)
    @Builder.Default
    private Boolean seasonal = false;

    @Column(name = "season_name", length = 150)
    private String seasonName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Rates per 1 KM
    @Column(name = "weekday_day_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal weekdayDayRate;

    @Column(name = "weekday_night_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal weekdayNightRate;

    @Column(name = "weekend_day_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal weekendDayRate;

    @Column(name = "weekend_night_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal weekendNightRate;

    // Optional base components
    @Column(name = "base_fare", precision = 10, scale = 2)
    private BigDecimal baseFare;

    @Column(name = "base_included_km")
    private Integer baseIncludedKm;

    @Column(name = "driver_batta_day", precision = 10, scale = 2)
    private BigDecimal driverBattaDay;

    @Column(name = "driver_batta_night", precision = 10, scale = 2)
    private BigDecimal driverBattaNight;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

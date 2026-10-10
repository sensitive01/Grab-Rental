package com.grabrentals.tariff.dto;

import com.grabrentals.tariff.entity.VehicleTariff;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleTariffResponse {

    private UUID id;
    private String category;
    private String modelName;
    private String seatingCapacity;
    private Boolean seasonal;
    private String seasonName;
    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal weekdayDayRate;
    private BigDecimal weekdayNightRate;
    private BigDecimal weekendDayRate;
    private BigDecimal weekendNightRate;

    private BigDecimal baseFare;
    private Integer baseIncludedKm;
    private BigDecimal driverBattaDay;
    private BigDecimal driverBattaNight;

    private Instant createdAt;
    private Instant updatedAt;

    public static VehicleTariffResponse fromEntity(VehicleTariff entity) {
        if (entity == null) return null;
        return VehicleTariffResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .modelName(entity.getModelName())
                .seatingCapacity(entity.getSeatingCapacity())
                .seasonal(entity.getSeasonal())
                .seasonName(entity.getSeasonName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .weekdayDayRate(entity.getWeekdayDayRate())
                .weekdayNightRate(entity.getWeekdayNightRate())
                .weekendDayRate(entity.getWeekendDayRate())
                .weekendNightRate(entity.getWeekendNightRate())
                .baseFare(entity.getBaseFare())
                .baseIncludedKm(entity.getBaseIncludedKm())
                .driverBattaDay(entity.getDriverBattaDay())
                .driverBattaNight(entity.getDriverBattaNight())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

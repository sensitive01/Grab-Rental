package com.grabrentals.tariff.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleTariffRequest {

    private UUID id;

    @NotBlank(message = "Vehicle category is required")
    private String category;

    @NotBlank(message = "Model name is required")
    private String modelName;

    @NotBlank(message = "Seating capacity is required")
    private String seatingCapacity;

    @Builder.Default
    private Boolean seasonal = false;

    private String seasonName;

    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Weekday day rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be greater than 0")
    private BigDecimal weekdayDayRate;

    @NotNull(message = "Weekday night rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be greater than 0")
    private BigDecimal weekdayNightRate;

    @NotNull(message = "Weekend day rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be greater than 0")
    private BigDecimal weekendDayRate;

    @NotNull(message = "Weekend night rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rate must be greater than 0")
    private BigDecimal weekendNightRate;

    private BigDecimal baseFare;

    private Integer baseIncludedKm;

    private BigDecimal driverBattaDay;

    private BigDecimal driverBattaNight;
}

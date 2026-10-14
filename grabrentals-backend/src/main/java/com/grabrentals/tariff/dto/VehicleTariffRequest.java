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
    private String fuelType = "Diesel";

    @Builder.Default
    private Boolean seasonal = false;

    private String seasonName;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private String serviceType = "OUTSTATION"; // OUTSTATION, HOURLY, AIRPORT

    private String state;
    private String city;

    // Outstation Customer Rates
    private BigDecimal weekdayDayRate;
    private BigDecimal weekdayNightRate;
    private BigDecimal weekendDayRate;
    private BigDecimal weekendNightRate;
    private BigDecimal baseFare;
    private Integer baseIncludedKm;
    private BigDecimal driverBattaDay;
    private BigDecimal driverBattaNight;

    // Outstation Vendor Rates
    private BigDecimal vendorWeekdayDayRate;
    private BigDecimal vendorWeekdayNightRate;
    private BigDecimal vendorWeekendDayRate;
    private BigDecimal vendorWeekendNightRate;
    private BigDecimal vendorBaseFare;
    private BigDecimal vendorDriverBattaDay;
    private BigDecimal vendorDriverBattaNight;

    // Hourly / Local Package components
    private Integer packageHours;
    private Integer packageKm;
    private BigDecimal hourlyWeekdayDayRate;
    private BigDecimal hourlyVendorWeekdayDayRate;
    private BigDecimal hourlyWeekdayNightRate;
    private BigDecimal hourlyVendorWeekdayNightRate;
    private BigDecimal hourlyWeekendDayRate;
    private BigDecimal hourlyVendorWeekendDayRate;
    private BigDecimal hourlyWeekendNightRate;
    private BigDecimal hourlyVendorWeekendNightRate;
    private BigDecimal hourlyCustomerFare;
    private BigDecimal hourlyVendorFare;
    private BigDecimal hourlyCustomerWeekendFare;
    private BigDecimal hourlyVendorWeekendFare;
    private BigDecimal extraKmRate;
    private BigDecimal vendorExtraKmRate;
    private BigDecimal extraHourRate;
    private BigDecimal vendorExtraHourRate;

    // Airport Transfer components
    private BigDecimal airportCustomerFare;
    private BigDecimal airportVendorFare;
    private BigDecimal airportCustomerWeekendFare;
    private BigDecimal airportVendorWeekendFare;
    private Integer airportIncludedKm;
    private BigDecimal airportExtraKmRate;
    private BigDecimal vendorExtraKmRateAirport;
    private BigDecimal airportVendorExtraKmRate;
    @Builder.Default
    private Boolean tollIncluded = false;
}

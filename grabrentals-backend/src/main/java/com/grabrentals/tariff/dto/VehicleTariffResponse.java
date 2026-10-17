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
    private String fuelType;
    private Boolean seasonal;
    private String seasonName;
    private LocalDate startDate;
    private LocalDate endDate;

    private String serviceType;
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
    private BigDecimal airportVendorExtraKmRate;
    private Boolean tollIncluded;
    private BigDecimal discountPercentage;
    private BigDecimal petCharge;
    private BigDecimal vendorPetCharge;

    private Instant createdAt;
    private Instant updatedAt;

    public static VehicleTariffResponse fromEntity(VehicleTariff entity) {
        if (entity == null) return null;
        return VehicleTariffResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .modelName(entity.getModelName())
                .seatingCapacity(entity.getSeatingCapacity())
                .fuelType(entity.getFuelType() != null && !entity.getFuelType().isBlank() ? entity.getFuelType() : "Diesel")
                .seasonal(entity.getSeasonal())
                .seasonName(entity.getSeasonName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .serviceType(entity.getServiceType() != null ? entity.getServiceType() : "OUTSTATION")
                .state(entity.getState())
                .city(entity.getCity())
                .weekdayDayRate(entity.getWeekdayDayRate())
                .weekdayNightRate(entity.getWeekdayNightRate())
                .weekendDayRate(entity.getWeekendDayRate())
                .weekendNightRate(entity.getWeekendNightRate())
                .vendorWeekdayDayRate(entity.getVendorWeekdayDayRate())
                .vendorWeekdayNightRate(entity.getVendorWeekdayNightRate())
                .vendorWeekendDayRate(entity.getVendorWeekendDayRate())
                .vendorWeekendNightRate(entity.getVendorWeekendNightRate())
                .baseFare(entity.getBaseFare())
                .baseIncludedKm(entity.getBaseIncludedKm())
                .driverBattaDay(entity.getDriverBattaDay())
                .driverBattaNight(entity.getDriverBattaNight())
                .vendorBaseFare(entity.getVendorBaseFare())
                .vendorDriverBattaDay(entity.getVendorDriverBattaDay())
                .vendorDriverBattaNight(entity.getVendorDriverBattaNight())
                .packageHours(entity.getPackageHours())
                .packageKm(entity.getPackageKm())
                .hourlyWeekdayDayRate(entity.getHourlyWeekdayDayRate())
                .hourlyVendorWeekdayDayRate(entity.getHourlyVendorWeekdayDayRate())
                .hourlyWeekdayNightRate(entity.getHourlyWeekdayNightRate())
                .hourlyVendorWeekdayNightRate(entity.getHourlyVendorWeekdayNightRate())
                .hourlyWeekendDayRate(entity.getHourlyWeekendDayRate())
                .hourlyVendorWeekendDayRate(entity.getHourlyVendorWeekendDayRate())
                .hourlyWeekendNightRate(entity.getHourlyWeekendNightRate())
                .hourlyVendorWeekendNightRate(entity.getHourlyVendorWeekendNightRate())
                .hourlyCustomerFare(entity.getHourlyCustomerFare())
                .hourlyVendorFare(entity.getHourlyVendorFare())
                .hourlyCustomerWeekendFare(entity.getHourlyCustomerWeekendFare())
                .hourlyVendorWeekendFare(entity.getHourlyVendorWeekendFare())
                .extraKmRate(entity.getExtraKmRate())
                .vendorExtraKmRate(entity.getVendorExtraKmRate())
                .extraHourRate(entity.getExtraHourRate())
                .vendorExtraHourRate(entity.getVendorExtraHourRate())
                .airportCustomerFare(entity.getAirportCustomerFare())
                .airportVendorFare(entity.getAirportVendorFare())
                .airportCustomerWeekendFare(entity.getAirportCustomerWeekendFare())
                .airportVendorWeekendFare(entity.getAirportVendorWeekendFare())
                .airportIncludedKm(entity.getAirportIncludedKm())
                .airportExtraKmRate(entity.getAirportExtraKmRate())
                .airportVendorExtraKmRate(entity.getAirportVendorExtraKmRate())
                .tollIncluded(entity.getTollIncluded())
                .discountPercentage(entity.getDiscountPercentage() != null ? entity.getDiscountPercentage() : BigDecimal.ZERO)
                .petCharge(entity.getPetCharge() != null ? entity.getPetCharge() : BigDecimal.ZERO)
                .vendorPetCharge(entity.getVendorPetCharge() != null ? entity.getVendorPetCharge() : BigDecimal.ZERO)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

package com.grabrentals.tariff.dto;

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
public class AirportTariffResponse {

    private UUID id;
    private String tripDirection; // CITY_TO_AIRPORT, AIRPORT_TO_CITY, BOTH
    private String pricingType; // REGULAR, SEASONAL
    private String title;
    private String state;
    private String city;
    private String airportName;
    private Integer minKm;
    private Integer maxKm;
    private String category;
    private String modelName;
    private String seatingCapacity;
    private String fuelType;
    private BigDecimal customerFare;
    private BigDecimal vendorFare;
    private BigDecimal extraKmRate;
    private BigDecimal vendorExtraKmRate;
    private String daysOfWeek;
    private String timeSlotType;
    private String timeRangeStart;
    private String timeRangeEnd;
    private String expiryType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Boolean tollIncluded;
    private BigDecimal discountPercentage;
    private BigDecimal petCharge;
    private BigDecimal vendorPetCharge;
    private Instant createdAt;
    private Instant updatedAt;
}

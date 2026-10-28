package com.grabrentals.tariff.dto;

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
public class AirportTariffRequest {

    private UUID id;

    @NotBlank(message = "Trip direction is required (CITY_TO_AIRPORT, AIRPORT_TO_CITY, or BOTH)")
    private String tripDirection; // CITY_TO_AIRPORT, AIRPORT_TO_CITY, BOTH

    @NotBlank(message = "Pricing type is required (REGULAR or SEASONAL)")
    private String pricingType; // REGULAR, SEASONAL

    private String title;

    private String state;

    private String city;

    private String airportName;

    @NotNull(message = "Minimum KM is required")
    private Integer minKm;

    @NotNull(message = "Maximum KM is required")
    private Integer maxKm;

    @NotBlank(message = "Vehicle category is required")
    private String category;

    private String modelName;

    private String seatingCapacity;

    private String fuelType;

    @NotNull(message = "Customer fare is required")
    private BigDecimal customerFare;

    private BigDecimal vendorFare;

    private BigDecimal extraKmRate;

    private BigDecimal vendorExtraKmRate;

    private String daysOfWeek; // "ALL" or comma-separated "MON,TUE,WED,THU,FRI,SAT,SUN"

    private String timeSlotType; // "ALL_DAY", "DAY", "NIGHT", "CUSTOM"

    private String timeRangeStart; // "06:00"

    private String timeRangeEnd; // "22:00"

    private String expiryType; // "NEVER" or "FIXED_DAYS"

    private LocalDate startDate;

    private LocalDate endDate;

    private String status; // "ACTIVE" or "INACTIVE"

    private Boolean tollIncluded;

    private BigDecimal discountPercentage;

    private BigDecimal petCharge;

    private BigDecimal vendorPetCharge;
}

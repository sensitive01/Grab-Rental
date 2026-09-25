package com.grabrentals.fleet.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVehicleRequest {

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    @NotBlank(message = "Vehicle make & model is required")
    private String vehicleModel;

    @NotBlank(message = "Vehicle plate number is required")
    private String vehicleNumber;

    private String registrationNumber;

    @NotNull(message = "Seating capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 60, message = "Capacity cannot exceed 60")
    private Integer seatingCapacity;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    private String acType;

    @Min(value = 2000, message = "Year must be 2000 or later")
    private Integer year;

    private LocalDate insuranceExpiry;
    private LocalDate permitExpiry;
    private LocalDate fitnessExpiry;

    @NotNull(message = "Daily base rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Daily rate must be greater than 0")
    private BigDecimal dailyRate;

    @DecimalMin(value = "0.0", message = "Per KM rate must be non-negative")
    private BigDecimal perKmRate;

    private String currentLocation;

    private String imageUrl;
    private String rcDocumentUrl;
    private String insuranceDocumentUrl;
    private String permitDocumentUrl;
}

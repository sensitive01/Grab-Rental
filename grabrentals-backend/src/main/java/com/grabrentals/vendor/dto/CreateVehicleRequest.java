package com.grabrentals.vendor.dto;

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

    private String vehicleModel;

    @NotBlank(message = "Vehicle plate number is required")
    private String vehicleNumber;

    private String registrationNumber;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 60, message = "Capacity cannot exceed 60")
    private Integer seatingCapacity;

    private String fuelType;

    private String acType;
    private String variant;
    private String color;
    private String registrationType;
    private String alternateFuel;
    private String transmission;
    private Integer engineCc;
    private String parkingLocation;
    private String features;

    private Integer year;

    private LocalDate insuranceExpiry;
    private LocalDate permitExpiry;
    private LocalDate fitnessExpiry;

    private BigDecimal dailyRate;

    @DecimalMin(value = "0.0", message = "Per KM rate must be non-negative")
    private BigDecimal perKmRate;

    private String currentLocation;

    private String imageUrl;
    private String photos;
    private String rcDocumentUrl;
    private String insuranceDocumentUrl;
    private String permitDocumentUrl;
    private String fitnessDocumentUrl;
}

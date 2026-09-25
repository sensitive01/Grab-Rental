package com.grabrentals.fleet.dto;

import com.grabrentals.fleet.entity.Driver;
import com.grabrentals.fleet.entity.Vehicle;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    private UUID id;
    private UUID vendorId;
    private String vendorName;
    private String vehicleType;
    private String model;
    private String vehicleNumber;
    private String registrationNumber;
    private Integer seatingCapacity;
    private String fuelType;
    private String acType;
    private Integer year;
    private LocalDate insuranceExpiry;
    private LocalDate permitExpiry;
    private LocalDate fitnessExpiry;
    private BigDecimal dailyRate;
    private BigDecimal perKmRate;
    private String currentLocation;
    private String status;
    private String imageUrl;
    private String rcDocumentUrl;
    private String insuranceDocumentUrl;
    private String permitDocumentUrl;
    private UUID assignedDriverId;
    private String assignedDriverName;
    private String assignedDriverPhone;
    private Instant createdAt;
    private Instant updatedAt;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return fromEntity(vehicle, null);
    }

    public static VehicleResponse fromEntity(Vehicle vehicle, Driver driver) {
        UUID driverId = null;
        String driverName = null;
        String driverPhone = null;

        if (driver != null) {
            driverId = driver.getId();
            driverName = driver.getName();
            driverPhone = driver.getPhone();
        }

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vendorId(vehicle.getUser().getId())
                .vendorName(vehicle.getUser().getName())
                .vehicleType(vehicle.getVehicleType())
                .model(vehicle.getModel())
                .vehicleNumber(vehicle.getVehicleNumber())
                .registrationNumber(vehicle.getRegistrationNumber())
                .seatingCapacity(vehicle.getSeatingCapacity())
                .fuelType(vehicle.getFuelType())
                .acType(vehicle.getAcType())
                .year(vehicle.getYear())
                .insuranceExpiry(vehicle.getInsuranceExpiry())
                .permitExpiry(vehicle.getPermitExpiry())
                .fitnessExpiry(vehicle.getFitnessExpiry())
                .dailyRate(vehicle.getDailyRate())
                .perKmRate(vehicle.getPerKmRate())
                .currentLocation(vehicle.getCurrentLocation())
                .status(vehicle.getStatus() != null ? vehicle.getStatus().name() : "AVAILABLE")
                .imageUrl(vehicle.getImageUrl())
                .rcDocumentUrl(vehicle.getRcDocumentUrl())
                .insuranceDocumentUrl(vehicle.getInsuranceDocumentUrl())
                .permitDocumentUrl(vehicle.getPermitDocumentUrl())
                .assignedDriverId(driverId)
                .assignedDriverName(driverName)
                .assignedDriverPhone(driverPhone)
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}

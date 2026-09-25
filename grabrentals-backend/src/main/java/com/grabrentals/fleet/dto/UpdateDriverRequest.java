package com.grabrentals.fleet.dto;

import com.grabrentals.fleet.entity.DriverStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDriverRequest {

    @NotBlank(message = "Driver legal name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Primary mobile number is required")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Residential address is required")
    private String address;

    private LocalDate dob;

    private String bloodGroup;

    @NotBlank(message = "Emergency contact is required")
    private String emergencyContact;

    @NotBlank(message = "Commercial driving license number is required")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiry;

    @NotNull(message = "Driving experience is required")
    @Min(value = 0, message = "Experience years must be non-negative")
    @Max(value = 50, message = "Experience years cannot exceed 50")
    private Integer experienceYears;

    private UUID assignedVehicleId;

    private String licenseDocumentUrl;

    private String photoUrl;

    private DriverStatus status;
}

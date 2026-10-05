package com.grabrentals.vendor.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.grabrentals.vendor.entity.DriverStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDriverRequest {

    @NotBlank(message = "Driver legal name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Primary mobile number is required")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;

    @JsonAlias({"dateOfBirth", "dob"})
    private LocalDate dob;

    private String gender;

    private String bloodGroup;

    private String idProofType;

    private String idProofNumber;

    private String idProofDocumentUrl;

    private String licenseClass;

    private LocalDate drivingSince;

    private LocalDate joiningDate;

    private String addressProofType;

    private String addressProofNumber;

    private String addressProofDocumentUrl;

    private String emergencyContact;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String languagesSpoken;

    private String verificationStatus;

    private String notes;

    private BigDecimal rating;

    private Integer totalTrips;

    @NotBlank(message = "Commercial driving license number is required")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiry;

    private Integer experienceYears;

    private UUID assignedVehicleId;

    private String licenseDocumentUrl;

    private String photoUrl;

    private DriverStatus status;
}

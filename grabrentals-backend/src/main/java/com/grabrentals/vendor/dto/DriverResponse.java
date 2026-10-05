package com.grabrentals.vendor.dto;

import com.grabrentals.vendor.entity.Driver;
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
public class DriverResponse {

    private UUID id;
    private UUID vendorId;
    private String vendorName;
    private String name;
    private String phone;
    private String email;
    private String address;
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
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private Integer experienceYears;
    private UUID assignedVehicleId;
    private String assignedVehicle;
    private String licenseDocumentUrl;
    private String photoUrl;
    private String status;
    private BigDecimal rating;
    private Integer totalTrips;
    private Instant createdAt;
    private Instant updatedAt;

    public static DriverResponse fromEntity(Driver driver) {
        String assignedVehicleStr = null;
        UUID assignedVehicleId = null;

        if (driver.getAssignedVehicle() != null) {
            assignedVehicleId = driver.getAssignedVehicle().getId();
            assignedVehicleStr = driver.getAssignedVehicle().getModel() + 
                    " (" + driver.getAssignedVehicle().getVehicleNumber() + ")";
        }

        return DriverResponse.builder()
                .id(driver.getId())
                .vendorId(driver.getUser().getId())
                .vendorName(driver.getUser().getName())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .address(driver.getAddress())
                .dob(driver.getDob())
                .gender(driver.getGender())
                .bloodGroup(driver.getBloodGroup())
                .idProofType(driver.getIdProofType())
                .idProofNumber(driver.getIdProofNumber())
                .idProofDocumentUrl(driver.getIdProofDocumentUrl())
                .licenseClass(driver.getLicenseClass())
                .drivingSince(driver.getDrivingSince())
                .joiningDate(driver.getJoiningDate())
                .addressProofType(driver.getAddressProofType())
                .addressProofNumber(driver.getAddressProofNumber())
                .addressProofDocumentUrl(driver.getAddressProofDocumentUrl())
                .emergencyContact(driver.getEmergencyContact())
                .emergencyContactName(driver.getEmergencyContactName())
                .emergencyContactPhone(driver.getEmergencyContactPhone())
                .languagesSpoken(driver.getLanguagesSpoken())
                .verificationStatus(driver.getVerificationStatus())
                .notes(driver.getNotes())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiry(driver.getLicenseExpiry())
                .experienceYears(driver.getExperienceYears())
                .assignedVehicleId(assignedVehicleId)
                .assignedVehicle(assignedVehicleStr)
                .licenseDocumentUrl(driver.getLicenseDocumentUrl())
                .photoUrl(driver.getPhotoUrl())
                .status(driver.getStatus() != null ? driver.getStatus().name() : "AVAILABLE")
                .rating(driver.getRating())
                .totalTrips(driver.getTotalTrips())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}

package com.grabrentals.admin.dto;

import com.grabrentals.user.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVendorUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Business name is required")
    private String businessName;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    private String alternatePhone;

    private String city;

    private String address;

    private String businessType;

    private String tradeName;

    private String gstin;

    private String pan;

    private String state;

    private String pincode;

    private String bankName;

    private String accountNumber;

    private String ifsc;

    private String branch;

    private String fleetModel;

    private Integer fleetSize;

    private Double commissionRate;

    private Boolean ownsBusiness;

    private String idProofDocumentUrl;

    private String addressProofDocumentUrl;

    private String businessProofDocumentUrl;

    private String gstDocumentUrl;

    private String panDocumentUrl;

    private String vehicleNumber;

    private String vehicleModel;

    private String vehicleCategory;

    private Integer seatingCapacity;

    private String fuelType;

    private String driverLicenseNumber;
}

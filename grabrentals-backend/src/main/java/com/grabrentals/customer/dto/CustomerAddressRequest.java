package com.grabrentals.customer.dto;

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
public class CustomerAddressRequest {

    @NotBlank(message = "Address label is required (e.g. Home, Office, Other)")
    @Size(max = 50, message = "Label cannot exceed 50 characters")
    private String tag;

    @NotBlank(message = "Address detail is required")
    private String addressLine;

    private String area;

    private String city;

    private String state;

    private String pincode;

    private String landmark;

    private Boolean isDefault;
}

package com.grabrentals.enquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+ -]{10,15}$", message = "Please provide a valid phone number")
    private String phone;

    @NotBlank(message = "Requirements cannot be empty")
    private String requirements;

    private String sourcePage;
}

package com.example.rental.auth.dto;

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
public class SendOtpRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(\\+?[0-9]{1,3}[-.\\s]?)?[0-9]{10}$",
        message = "Please provide a valid 10-digit mobile number"
    )
    private String phone;
}

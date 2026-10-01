package com.grabrentals.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDeclineRequest {

    @NotBlank(message = "Decline reason is required")
    private String reason;
}

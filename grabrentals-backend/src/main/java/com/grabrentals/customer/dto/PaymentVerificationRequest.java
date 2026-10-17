package com.grabrentals.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationRequest {

    @NotBlank(message = "Action is required (APPROVE or REJECT)")
    private String action; // "APPROVE" or "REJECT"

    private String rejectionReason;
}

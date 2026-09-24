package com.grabrentals.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendOtpResponse {
    private String phone;
    private int expiresInSeconds;
    private String devOtp; // Provided for testing convenience
}

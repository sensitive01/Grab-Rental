package com.grabrentals.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidateRequestDto {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Ride amount is required for validation")
    private BigDecimal rideAmount;
}

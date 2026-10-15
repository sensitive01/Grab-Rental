package com.grabrentals.coupon.dto;

import com.grabrentals.coupon.entity.DiscountType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidateResponseDto {

    private boolean valid;
    private String code;
    private String title;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}

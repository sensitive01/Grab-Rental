package com.grabrentals.coupon.dto;

import com.grabrentals.coupon.entity.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequestDto {

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String title;

    private String description;

    @NotNull(message = "Discount type is required (PERCENTAGE or FLAT)")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minRideAmount;

    private Integer usageLimit;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    private Boolean active;

    private com.grabrentals.coupon.entity.TargetAudience targetAudience;

    private String specificIdentifiers;

    private Integer perUserLimit;

    private String serviceType;
    private String state;
    private String city;
}

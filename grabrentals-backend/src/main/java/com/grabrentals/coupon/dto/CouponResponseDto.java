package com.grabrentals.coupon.dto;

import com.grabrentals.coupon.entity.Coupon;
import com.grabrentals.coupon.entity.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponseDto {

    private Long id;
    private String code;
    private String title;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minRideAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Boolean active;
    private com.grabrentals.coupon.entity.TargetAudience targetAudience;
    private String specificIdentifiers;
    private Integer perUserLimit;
    private String serviceType;
    private String state;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CouponResponseDto fromEntity(Coupon c) {
        if (c == null) return null;
        return CouponResponseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .description(c.getDescription())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .minRideAmount(c.getMinRideAmount())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .validFrom(c.getValidFrom())
                .validUntil(c.getValidUntil())
                .active(c.getActive())
                .targetAudience(c.getTargetAudience())
                .specificIdentifiers(c.getSpecificIdentifiers())
                .perUserLimit(c.getPerUserLimit())
                .serviceType(c.getServiceType())
                .state(c.getState() != null ? c.getState() : "ALL")
                .city(c.getCity() != null ? c.getCity() : "ALL")
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}

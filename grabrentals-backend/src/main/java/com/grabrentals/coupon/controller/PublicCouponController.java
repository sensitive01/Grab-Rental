package com.grabrentals.coupon.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.coupon.dto.CouponResponseDto;
import com.grabrentals.coupon.dto.CouponValidateRequestDto;
import com.grabrentals.coupon.dto.CouponValidateResponseDto;
import com.grabrentals.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidateResponseDto>> validateCoupon(
            @Valid @RequestBody CouponValidateRequestDto request
    ) {
        CouponValidateResponseDto result = couponService.validateCoupon(request.getCode(), request.getRideAmount());
        return ResponseEntity.ok(ApiResponse.<CouponValidateResponseDto>builder()
                .success(result.isValid())
                .message(result.getMessage())
                .data(result)
                .timestamp(java.time.Instant.now())
                .build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CouponResponseDto>>> getActiveCoupons() {
        List<CouponResponseDto> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success("Active promotional coupons retrieved", coupons));
    }
}

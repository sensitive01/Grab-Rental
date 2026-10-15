package com.grabrentals.coupon.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.coupon.dto.CouponRequestDto;
import com.grabrentals.coupon.dto.CouponResponseDto;
import com.grabrentals.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponseDto>>> getAllCoupons() {
        List<CouponResponseDto> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", coupons));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponseDto>> getCouponById(@PathVariable Long id) {
        CouponResponseDto coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon retrieved successfully", coupon));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponseDto>> createCoupon(@Valid @RequestBody CouponRequestDto req) {
        CouponResponseDto created = couponService.createCoupon(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponResponseDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequestDto req
    ) {
        CouponResponseDto updated = couponService.updateCoupon(id, req);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CouponResponseDto>> toggleStatus(@PathVariable Long id) {
        CouponResponseDto toggled = couponService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon status updated", toggled));
    }
}

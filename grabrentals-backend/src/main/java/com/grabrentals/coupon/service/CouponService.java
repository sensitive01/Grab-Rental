package com.grabrentals.coupon.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.coupon.dto.CouponRequestDto;
import com.grabrentals.coupon.dto.CouponResponseDto;
import com.grabrentals.coupon.dto.CouponValidateResponseDto;
import com.grabrentals.coupon.entity.Coupon;
import com.grabrentals.coupon.entity.DiscountType;
import com.grabrentals.coupon.repository.CouponRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    @PostConstruct
    public void initSeedCoupons() {
        if (couponRepository.count() == 0) {
            log.info("Seeding initial promotional coupon codes...");
            Coupon welcome = Coupon.builder()
                    .code("WELCOME10")
                    .title("Welcome Discount")
                    .description("10% off up to ₹250 on outstation bookings")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(new BigDecimal("10.00"))
                    .maxDiscountAmount(new BigDecimal("250.00"))
                    .minRideAmount(new BigDecimal("1000.00"))
                    .usageLimit(1000)
                    .usedCount(0)
                    .validFrom(LocalDateTime.now().minusDays(1))
                    .validUntil(LocalDateTime.now().plusMonths(6))
                    .active(true)
                    .build();

            Coupon grab200 = Coupon.builder()
                    .code("GRAB200")
                    .title("Flat ₹200 Off")
                    .description("Flat ₹200 instant discount on long rides")
                    .discountType(DiscountType.FLAT)
                    .discountValue(new BigDecimal("200.00"))
                    .minRideAmount(new BigDecimal("2000.00"))
                    .usageLimit(500)
                    .usedCount(0)
                    .validFrom(LocalDateTime.now().minusDays(1))
                    .validUntil(LocalDateTime.now().plusMonths(6))
                    .active(true)
                    .build();

            Coupon mega500 = Coupon.builder()
                    .code("MEGA500")
                    .title("Mega Outstation Savings")
                    .description("Flat ₹500 off on long distance and multi-day trips")
                    .discountType(DiscountType.FLAT)
                    .discountValue(new BigDecimal("500.00"))
                    .minRideAmount(new BigDecimal("4000.00"))
                    .usageLimit(250)
                    .usedCount(0)
                    .validFrom(LocalDateTime.now().minusDays(1))
                    .validUntil(LocalDateTime.now().plusMonths(6))
                    .active(true)
                    .build();

            couponRepository.saveAll(List.of(welcome, grab200, mega500));
            log.info("Seeded 3 default coupons: WELCOME10, GRAB200, MEGA500");
        }
    }

    @Transactional(readOnly = true)
    public CouponValidateResponseDto validateCoupon(String code, BigDecimal rideAmount) {
        if (code == null || code.trim().isEmpty()) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .message("Please enter a coupon code.")
                    .build();
        }

        if (rideAmount == null || rideAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .message("Ride amount must be greater than zero to apply a coupon.")
                    .build();
        }

        String cleanCode = code.trim().toUpperCase();
        var opt = couponRepository.findByCodeIgnoreCase(cleanCode);
        if (opt.isEmpty()) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("Invalid coupon code. Please check and try again.")
                    .build();
        }

        Coupon coupon = opt.get();
        if (!Boolean.TRUE.equals(coupon.getActive())) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("This coupon code is no longer active.")
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("This promotional offer has not started yet.")
                    .build();
        }

        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("This coupon code has expired.")
                    .build();
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("This coupon has reached its maximum usage limit.")
                    .build();
        }

        if (coupon.getMinRideAmount() != null && rideAmount.compareTo(coupon.getMinRideAmount()) < 0) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("Minimum ride amount of ₹" + coupon.getMinRideAmount().stripTrailingZeros().toPlainString() + " required to use this coupon.")
                    .build();
        }

        // Calculate discount
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal rawDiscount = rideAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && rawDiscount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            } else {
                discount = rawDiscount;
            }
        } else {
            discount = coupon.getDiscountValue().min(rideAmount);
        }

        // Discount cannot exceed ride amount
        discount = discount.min(rideAmount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalAmount = rideAmount.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return CouponValidateResponseDto.builder()
                .valid(true)
                .code(coupon.getCode())
                .title(coupon.getTitle())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .message("Coupon '" + coupon.getCode() + "' applied successfully!")
                .build();
    }

    @Transactional(readOnly = true)
    public List<CouponResponseDto> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CouponResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponResponseDto> getActiveCoupons() {
        return couponRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(CouponResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponResponseDto getCouponById(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        return CouponResponseDto.fromEntity(c);
    }

    @Transactional
    public CouponResponseDto createCoupon(CouponRequestDto req) {
        String cleanCode = req.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("A coupon with code '" + cleanCode + "' already exists.");
        }

        Coupon c = Coupon.builder()
                .code(cleanCode)
                .title(req.getTitle())
                .description(req.getDescription())
                .discountType(req.getDiscountType())
                .discountValue(req.getDiscountValue())
                .maxDiscountAmount(req.getMaxDiscountAmount())
                .minRideAmount(req.getMinRideAmount())
                .usageLimit(req.getUsageLimit())
                .usedCount(0)
                .validFrom(req.getValidFrom() != null ? req.getValidFrom() : LocalDateTime.now())
                .validUntil(req.getValidUntil())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();

        Coupon saved = couponRepository.save(c);
        return CouponResponseDto.fromEntity(saved);
    }

    @Transactional
    public CouponResponseDto updateCoupon(Long id, CouponRequestDto req) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        String cleanCode = req.getCode().trim().toUpperCase();
        if (!c.getCode().equalsIgnoreCase(cleanCode) && couponRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("A coupon with code '" + cleanCode + "' already exists.");
        }

        c.setCode(cleanCode);
        c.setTitle(req.getTitle());
        c.setDescription(req.getDescription());
        c.setDiscountType(req.getDiscountType());
        c.setDiscountValue(req.getDiscountValue());
        c.setMaxDiscountAmount(req.getMaxDiscountAmount());
        c.setMinRideAmount(req.getMinRideAmount());
        c.setUsageLimit(req.getUsageLimit());
        if (req.getValidFrom() != null) c.setValidFrom(req.getValidFrom());
        if (req.getValidUntil() != null) c.setValidUntil(req.getValidUntil());
        if (req.getActive() != null) c.setActive(req.getActive());

        Coupon updated = couponRepository.save(c);
        return CouponResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional
    public CouponResponseDto toggleStatus(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        c.setActive(!Boolean.TRUE.equals(c.getActive()));
        Coupon updated = couponRepository.save(c);
        return CouponResponseDto.fromEntity(updated);
    }

    @Transactional
    public void recordCouponUsage(String code) {
        if (code == null || code.trim().isEmpty()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(c -> {
            c.setUsedCount((c.getUsedCount() != null ? c.getUsedCount() : 0) + 1);
            couponRepository.save(c);
        });
    }
}

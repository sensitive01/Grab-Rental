package com.grabrentals.coupon.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.coupon.dto.CouponRequestDto;
import com.grabrentals.coupon.dto.CouponResponseDto;
import com.grabrentals.coupon.dto.CouponValidateResponseDto;
import com.grabrentals.coupon.entity.Coupon;
import com.grabrentals.coupon.entity.CouponRedemption;
import com.grabrentals.coupon.entity.DiscountType;
import com.grabrentals.coupon.entity.TargetAudience;
import com.grabrentals.coupon.repository.CouponRedemptionRepository;
import com.grabrentals.coupon.repository.CouponRepository;
import com.grabrentals.customer.repository.BookingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    @PostConstruct
    public void initSeedCoupons() {
        if (couponRepository.count() == 0) {
            log.info("Seeding initial promotional coupon codes...");
            Coupon welcome = Coupon.builder()
                    .code("WELCOME10")
                    .title("Welcome Discount")
                    .description("10% off up to ₹250 on first outstation booking")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(new BigDecimal("10.00"))
                    .maxDiscountAmount(new BigDecimal("250.00"))
                    .minRideAmount(new BigDecimal("1000.00"))
                    .usageLimit(1000)
                    .usedCount(0)
                    .targetAudience(TargetAudience.NEW_USERS_ONLY)
                    .perUserLimit(1)
                    .serviceType("ALL")
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
                    .targetAudience(TargetAudience.ALL_USERS)
                    .perUserLimit(2)
                    .serviceType("ALL")
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
                    .targetAudience(TargetAudience.EXISTING_USERS_ONLY)
                    .perUserLimit(1)
                    .serviceType("OUTSTATION")
                    .validFrom(LocalDateTime.now().minusDays(1))
                    .validUntil(LocalDateTime.now().plusMonths(6))
                    .active(true)
                    .build();

            couponRepository.saveAll(List.of(welcome, grab200, mega500));
            log.info("Default promo coupons seeded successfully.");
        }
    }

    @Transactional(readOnly = true)
    public CouponValidateResponseDto validateCoupon(String code, BigDecimal rideAmount) {
        return validateCoupon(code, rideAmount, null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public CouponValidateResponseDto validateCoupon(
            String code,
            BigDecimal rideAmount,
            String customerPhone,
            String customerEmail,
            String tripType
    ) {
        return validateCoupon(code, rideAmount, customerPhone, customerEmail, tripType, null, null);
    }

    @Transactional(readOnly = true)
    public CouponValidateResponseDto validateCoupon(
            String code,
            BigDecimal rideAmount,
            String customerPhone,
            String customerEmail,
            String tripType,
            String state,
            String city
    ) {
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
                    .message("This coupon has reached its maximum total usage limit.")
                    .build();
        }

        if (coupon.getMinRideAmount() != null && rideAmount.compareTo(coupon.getMinRideAmount()) < 0) {
            return CouponValidateResponseDto.builder()
                    .valid(false)
                    .code(cleanCode)
                    .message("Minimum ride amount of ₹" + coupon.getMinRideAmount().stripTrailingZeros().toPlainString() + " required to use this coupon.")
                    .build();
        }

        // Service Type restriction check
        if (coupon.getServiceType() != null && !coupon.getServiceType().equalsIgnoreCase("ALL")) {
            if (tripType != null && !tripType.isBlank()) {
                if (!coupon.getServiceType().equalsIgnoreCase(tripType.trim())) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This coupon is only valid for " + coupon.getServiceType() + " journeys.")
                            .build();
                }
            }
        }

        // State restriction check
        if (coupon.getState() != null && !coupon.getState().equalsIgnoreCase("ALL") && !coupon.getState().isBlank()) {
            if (state != null && !state.isBlank()) {
                if (!coupon.getState().trim().equalsIgnoreCase(state.trim())) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This coupon is only valid for journeys starting in " + coupon.getState() + ".")
                            .build();
                }
            }
        }

        // City restriction check
        if (coupon.getCity() != null && !coupon.getCity().equalsIgnoreCase("ALL") && !coupon.getCity().isBlank()) {
            if (city != null && !city.isBlank()) {
                String reqCity = city.trim().toLowerCase();
                String allowedCity = coupon.getCity().trim().toLowerCase();
                if (!reqCity.contains(allowedCity) && !allowedCity.contains(reqCity)) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This coupon is only valid for journeys starting in " + coupon.getCity() + ".")
                            .build();
                }
            }
        }

        // Normalize phone number (last 10 digits)
        String cleanPhone = null;
        if (customerPhone != null && !customerPhone.isBlank()) {
            String digits = customerPhone.replaceAll("[^0-9]", "");
            cleanPhone = digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
        }

        String cleanEmail = (customerEmail != null && !customerEmail.isBlank())
                ? customerEmail.trim().toLowerCase()
                : null;

        // Target Audience Eligibility Checks
        TargetAudience audience = coupon.getTargetAudience() != null ? coupon.getTargetAudience() : TargetAudience.ALL_USERS;

        if (audience == TargetAudience.NEW_USERS_ONLY) {
            if (cleanPhone != null || cleanEmail != null) {
                long pastBookings = bookingRepository.countValidBookingsByPhoneOrEmail(cleanPhone, cleanEmail);
                if (pastBookings > 0) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This offer is exclusively for first-time customers on their first booking.")
                            .build();
                }
            }
        } else if (audience == TargetAudience.EXISTING_USERS_ONLY) {
            if (cleanPhone != null || cleanEmail != null) {
                long pastBookings = bookingRepository.countValidBookingsByPhoneOrEmail(cleanPhone, cleanEmail);
                if (pastBookings == 0) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This loyalty offer is reserved for returning Grab Rentals travelers.")
                            .build();
                }
            }
        } else if (audience == TargetAudience.SPECIFIC_USERS) {
            if (coupon.getSpecificIdentifiers() != null && !coupon.getSpecificIdentifiers().isBlank()) {
                List<String> allowedList = Arrays.stream(coupon.getSpecificIdentifiers().split("[,;\\n]+"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                boolean matched = false;
                if (cleanPhone != null) {
                    for (String allowed : allowedList) {
                        String allowedDigits = allowed.replaceAll("[^0-9]", "");
                        if (!allowedDigits.isEmpty()) {
                            String last10 = allowedDigits.length() > 10 ? allowedDigits.substring(allowedDigits.length() - 10) : allowedDigits;
                            if (last10.equals(cleanPhone)) {
                                matched = true;
                                break;
                            }
                        }
                    }
                }
                if (!matched && cleanEmail != null) {
                    matched = allowedList.contains(cleanEmail);
                }

                if (!matched) {
                    return CouponValidateResponseDto.builder()
                            .valid(false)
                            .code(cleanCode)
                            .message("This exclusive promotional offer is reserved for selected accounts.")
                            .build();
                }
            }
        }

        // Per-User Limit Check (defaults to 1 if not explicitly set)
        int perLimit = (coupon.getPerUserLimit() != null && coupon.getPerUserLimit() > 0)
                ? coupon.getPerUserLimit()
                : 1;

        if (cleanPhone != null || cleanEmail != null) {
            long redemptions = 0;
            if (cleanPhone != null) {
                redemptions = Math.max(redemptions, couponRedemptionRepository.countByCouponCodeIgnoreCaseAndCustomerPhone(cleanCode, cleanPhone));
            }
            if (cleanEmail != null) {
                redemptions = Math.max(redemptions, couponRedemptionRepository.countByCouponCodeIgnoreCaseAndCustomerEmail(cleanCode, cleanEmail));
            }

            // Also check confirmed bookings table in case redemption was logged on a previous booking
            long bookingUsage = bookingRepository.countBookingsWithCouponForCustomer(cleanCode, cleanPhone, cleanEmail);
            redemptions = Math.max(redemptions, bookingUsage);

            if (redemptions >= perLimit) {
                return CouponValidateResponseDto.builder()
                        .valid(false)
                        .code(cleanCode)
                        .message("You have already used this coupon the maximum allowed number of times (" + perLimit + ").")
                        .build();
            }
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

    @Transactional
    public List<CouponResponseDto> getAllCoupons() {
        List<Coupon> list = couponRepository.findAllByOrderByCreatedAtDesc();
        for (Coupon c : list) {
            long redemptions = couponRedemptionRepository.countByCouponCodeIgnoreCase(c.getCode());
            long bookings = bookingRepository.countBookingsByCouponCode(c.getCode());
            int maxUsed = (int) Math.max(c.getUsedCount() != null ? c.getUsedCount() : 0, Math.max(redemptions, bookings));
            if (c.getUsedCount() == null || c.getUsedCount() != maxUsed) {
                c.setUsedCount(maxUsed);
                couponRepository.save(c);
            }
        }
        return list.stream()
                .map(CouponResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CouponResponseDto> getActiveCoupons() {
        List<Coupon> list = couponRepository.findByActiveTrueOrderByCreatedAtDesc();
        for (Coupon c : list) {
            long redemptions = couponRedemptionRepository.countByCouponCodeIgnoreCase(c.getCode());
            long bookings = bookingRepository.countBookingsByCouponCode(c.getCode());
            int maxUsed = (int) Math.max(c.getUsedCount() != null ? c.getUsedCount() : 0, Math.max(redemptions, bookings));
            if (c.getUsedCount() == null || c.getUsedCount() != maxUsed) {
                c.setUsedCount(maxUsed);
                couponRepository.save(c);
            }
        }
        return list.stream()
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
                .targetAudience(req.getTargetAudience() != null ? req.getTargetAudience() : TargetAudience.ALL_USERS)
                .specificIdentifiers(req.getSpecificIdentifiers())
                .perUserLimit(req.getPerUserLimit())
                .serviceType(req.getServiceType() != null && !req.getServiceType().isBlank() ? req.getServiceType() : "ALL")
                .state(req.getState() != null && !req.getState().isBlank() ? req.getState().trim() : "ALL")
                .city(req.getCity() != null && !req.getCity().isBlank() ? req.getCity().trim() : "ALL")
                .validFrom(req.getValidFrom() != null ? req.getValidFrom() : LocalDateTime.now())
                .validUntil(req.getValidUntil())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();

        Coupon saved = couponRepository.save(c);
        log.info("Created new coupon '{}' with audience '{}'", saved.getCode(), saved.getTargetAudience());
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
        if (req.getTargetAudience() != null) c.setTargetAudience(req.getTargetAudience());
        if (req.getSpecificIdentifiers() != null) c.setSpecificIdentifiers(req.getSpecificIdentifiers());
        if (req.getPerUserLimit() != null) c.setPerUserLimit(req.getPerUserLimit());
        if (req.getServiceType() != null) c.setServiceType(req.getServiceType());
        if (req.getState() != null) c.setState(req.getState().isBlank() ? "ALL" : req.getState().trim());
        if (req.getCity() != null) c.setCity(req.getCity().isBlank() ? "ALL" : req.getCity().trim());
        if (req.getValidFrom() != null) c.setValidFrom(req.getValidFrom());
        if (req.getValidUntil() != null) c.setValidUntil(req.getValidUntil());
        if (req.getActive() != null) c.setActive(req.getActive());

        Coupon updated = couponRepository.save(c);
        log.info("Updated coupon '{}' with audience '{}'", updated.getCode(), updated.getTargetAudience());
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
    public void recordCouponUsage(String code, String phone, String email) {
        if (code == null || code.trim().isEmpty()) return;
        String cleanCode = code.trim().toUpperCase();

        couponRepository.findByCodeIgnoreCase(cleanCode).ifPresent(c -> {
            c.setUsedCount((c.getUsedCount() != null ? c.getUsedCount() : 0) + 1);
            couponRepository.save(c);

            String cleanPhone = null;
            if (phone != null && !phone.isBlank()) {
                String digits = phone.replaceAll("[^0-9]", "");
                cleanPhone = digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
            }

            CouponRedemption redemption = CouponRedemption.builder()
                    .couponCode(cleanCode)
                    .customerPhone(cleanPhone)
                    .customerEmail(email != null ? email.trim().toLowerCase() : null)
                    .build();
            couponRedemptionRepository.save(redemption);
            log.info("Recorded coupon redemption for code '{}' by phone '{}'", cleanCode, cleanPhone);
        });
    }

    @Transactional
    public void recordCouponUsage(String code) {
        recordCouponUsage(code, null, null);
    }
}

package com.grabrentals.coupon.repository;

import com.grabrentals.coupon.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    long countByCouponCodeIgnoreCaseAndCustomerPhone(String couponCode, String customerPhone);
    long countByCouponCodeIgnoreCaseAndCustomerEmail(String couponCode, String customerEmail);
    long countByCouponCodeIgnoreCase(String couponCode);
}

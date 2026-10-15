package com.grabrentals.coupon.repository;

import com.grabrentals.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);

    List<Coupon> findAllByOrderByCreatedAtDesc();

    List<Coupon> findByActiveTrueOrderByCreatedAtDesc();

    boolean existsByCodeIgnoreCase(String code);
}

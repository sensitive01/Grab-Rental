package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.PricingTaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PricingTaxConfigRepository extends JpaRepository<PricingTaxConfig, UUID> {
}

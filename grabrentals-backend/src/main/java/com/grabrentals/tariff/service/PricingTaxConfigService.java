package com.grabrentals.tariff.service;

import com.grabrentals.tariff.entity.PricingTaxConfig;
import com.grabrentals.tariff.repository.PricingTaxConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingTaxConfigService {

    private final PricingTaxConfigRepository repository;

    @Transactional(readOnly = true)
    public PricingTaxConfig getConfig() {
        try {
            List<PricingTaxConfig> list = repository.findAll();
            if (!list.isEmpty()) {
                PricingTaxConfig config = list.get(0);
                if (config.getGstPercentage() == null) {
                    config.setGstPercentage(new BigDecimal("5.00"));
                }
                if (config.getGstAmount() == null) {
                    config.setGstAmount(BigDecimal.ZERO);
                }
                if (config.getGstType() == null) {
                    config.setGstType("PERCENTAGE");
                }
                if (config.getDriverAllowancePercentage() == null) {
                    config.setDriverAllowancePercentage(new BigDecimal("10.00"));
                }
                if (config.getDriverAllowanceAmount() == null) {
                    config.setDriverAllowanceAmount(BigDecimal.ZERO);
                }
                if (config.getDriverAllowanceType() == null) {
                    config.setDriverAllowanceType("PERCENTAGE");
                }
                if (config.getLessThan3YearsFee() == null) {
                    config.setLessThan3YearsFee(new BigDecimal("299.00"));
                }
                if (config.getLuggageCarrierFee() == null) {
                    config.setLuggageCarrierFee(new BigDecimal("249.00"));
                }
                if (config.getLanguageChauffeurFee() == null) {
                    config.setLanguageChauffeurFee(new BigDecimal("199.00"));
                }
                if (config.getExpresswayFee() == null) {
                    config.setExpresswayFee(new BigDecimal("415.00"));
                }
                return config;
            }
        } catch (Exception e) {
            log.warn("Could not query pricing_tax_configs from database, falling back to defaults: {}", e.getMessage());
        }
        return PricingTaxConfig.builder()
                .gstPercentage(new BigDecimal("5.00"))
                .gstAmount(BigDecimal.ZERO)
                .gstType("PERCENTAGE")
                .driverAllowancePercentage(new BigDecimal("10.00"))
                .driverAllowanceAmount(BigDecimal.ZERO)
                .driverAllowanceType("PERCENTAGE")
                .lessThan3YearsFee(new BigDecimal("299.00"))
                .luggageCarrierFee(new BigDecimal("249.00"))
                .languageChauffeurFee(new BigDecimal("199.00"))
                .expresswayFee(new BigDecimal("415.00"))
                .build();
    }

    @Transactional
    public PricingTaxConfig updateConfig(
            BigDecimal gstPercentage, 
            BigDecimal gstAmount,
            String gstType,
            BigDecimal driverAllowancePercentage,
            BigDecimal driverAllowanceAmount,
            String driverAllowanceType,
            BigDecimal lessThan3YearsFee,
            BigDecimal luggageCarrierFee,
            BigDecimal languageChauffeurFee,
            BigDecimal expresswayFee
    ) {
        PricingTaxConfig config;
        List<PricingTaxConfig> list = repository.findAll();
        if (!list.isEmpty()) {
            config = list.get(0);
        } else {
            config = new PricingTaxConfig();
        }

        if (gstPercentage != null && gstPercentage.compareTo(BigDecimal.ZERO) >= 0) {
            config.setGstPercentage(gstPercentage.setScale(2, RoundingMode.HALF_UP));
        }
        if (gstAmount != null && gstAmount.compareTo(BigDecimal.ZERO) >= 0) {
            config.setGstAmount(gstAmount.setScale(2, RoundingMode.HALF_UP));
        }
        if (gstType != null && !gstType.isBlank()) {
            config.setGstType(gstType.trim().toUpperCase());
        }
        if (driverAllowancePercentage != null && driverAllowancePercentage.compareTo(BigDecimal.ZERO) >= 0) {
            config.setDriverAllowancePercentage(driverAllowancePercentage.setScale(2, RoundingMode.HALF_UP));
        }
        if (driverAllowanceAmount != null && driverAllowanceAmount.compareTo(BigDecimal.ZERO) >= 0) {
            config.setDriverAllowanceAmount(driverAllowanceAmount.setScale(2, RoundingMode.HALF_UP));
        }
        if (driverAllowanceType != null && !driverAllowanceType.isBlank()) {
            config.setDriverAllowanceType(driverAllowanceType.trim().toUpperCase());
        }
        if (lessThan3YearsFee != null && lessThan3YearsFee.compareTo(BigDecimal.ZERO) >= 0) {
            config.setLessThan3YearsFee(lessThan3YearsFee.setScale(2, RoundingMode.HALF_UP));
        }
        if (luggageCarrierFee != null && luggageCarrierFee.compareTo(BigDecimal.ZERO) >= 0) {
            config.setLuggageCarrierFee(luggageCarrierFee.setScale(2, RoundingMode.HALF_UP));
        }
        if (languageChauffeurFee != null && languageChauffeurFee.compareTo(BigDecimal.ZERO) >= 0) {
            config.setLanguageChauffeurFee(languageChauffeurFee.setScale(2, RoundingMode.HALF_UP));
        }
        if (expresswayFee != null && expresswayFee.compareTo(BigDecimal.ZERO) >= 0) {
            config.setExpresswayFee(expresswayFee.setScale(2, RoundingMode.HALF_UP));
        }

        return repository.save(config);
    }
}

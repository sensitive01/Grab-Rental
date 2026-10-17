package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pricing_tax_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PricingTaxConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gst_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal gstPercentage = new BigDecimal("5.00");

    @Column(name = "gst_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "gst_type", length = 20)
    @Builder.Default
    private String gstType = "PERCENTAGE";

    @Column(name = "driver_allowance_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal driverAllowancePercentage = new BigDecimal("10.00");

    @Column(name = "driver_allowance_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal driverAllowanceAmount = BigDecimal.ZERO;

    @Column(name = "driver_allowance_type", length = 20)
    @Builder.Default
    private String driverAllowanceType = "PERCENTAGE";

    @Column(name = "less_than_3_years_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lessThan3YearsFee = new BigDecimal("299.00");

    @Column(name = "luggage_carrier_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal luggageCarrierFee = new BigDecimal("249.00");

    @Column(name = "language_chauffeur_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal languageChauffeurFee = new BigDecimal("199.00");

    @Column(name = "expressway_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal expresswayFee = new BigDecimal("415.00");

    @Column(name = "default_pet_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal defaultPetCharge = new BigDecimal("499.00");

    @Column(name = "default_vendor_pet_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal defaultVendorPetCharge = new BigDecimal("350.00");

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}

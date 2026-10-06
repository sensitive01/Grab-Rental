package com.grabrentals.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicVehicleCardDto {
    private String id;
    private String title;
    private String subtitle;
    private String category;
    private Double rating;
    private Integer ratingCount;
    private Integer seating;
    private String image;
    private Integer includedKms;
    private String postLimitRate;
    private PublicPricingDto pricing;
    private List<String> fuelOptions;
    private List<String> inclusions;
    private List<String> exclusions;
    private Integer availableCount;
    private String badge;
    private String vehicleNumber;
    private String regNumber;
    private String vehicleType;
    private String fuelType;
    private String transmission;
    private Integer year;
    private BigDecimal dailyPrice;
    private BigDecimal perKmRate;
    private String location;
    private String chauffeur;
    private Double chauffeurRating;
    private String status;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicPricingDto {
        private BigDecimal originalPrice;
        private BigDecimal discountedPrice;
        private BigDecimal chargesAndTaxes;
        private BigDecimal advanceAmount;
    }
}

package com.grabrentals.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripClosingRequest {
    private Double startKm;
    private Double endKm;
    private Double actualKm;
    private Double extraKm;
    private BigDecimal extraKmRate;
    private BigDecimal tollCharges;
    private BigDecimal permitCharges;
    private BigDecimal parkingCharges;
    private BigDecimal driverAllowance;
    private BigDecimal otherCharges;
    private String otherChargesNotes;
    private String closingNotes;
    private String paymentMethod;
    private String paymentProofUrl;
    private String endOdometerProofUrl;
}

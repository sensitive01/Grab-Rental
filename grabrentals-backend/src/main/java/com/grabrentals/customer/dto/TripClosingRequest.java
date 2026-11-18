package com.grabrentals.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripClosingRequest {
    // Fleet & Vendor Allocations / Overrides (when missing or updated)
    private UUID assignedVehicleId;
    private UUID assignedDriverId;
    private UUID vendorId;
    private String manualVehicleNumber;
    private String manualVehicleModel;
    private String manualDriverName;
    private String manualDriverPhone;
    private String manualVendorName;
    private BigDecimal vendorPayout;

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
    private String startOdometerProofUrl;
}


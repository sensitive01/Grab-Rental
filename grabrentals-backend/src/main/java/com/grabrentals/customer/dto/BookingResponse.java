package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;
    private String bookingReference;
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Vendor details
    private UUID vendorId;
    private String vendorBusinessName;
    private String vendorName;
    private String vendorPhone;

    // Vehicle details
    private UUID vehicleId;
    private String vehicleModel;
    private String vehicleNumber;
    private String vehicleType;

    // Driver details
    private UUID driverId;
    private String driverName;
    private String driverPhone;

    // Trip details
    private String tripType;
    private String pickupCity;
    private String dropCity;
    private String stops;
    private String pickupAddress;
    private Double pickupLat;
    private Double pickupLng;
    private String pickupDoorNo;
    private String pickupStreet;
    private String pickupArea;
    private String pickupLandmark;
    private String pickupPincode;
    private String dropAddress;
    private LocalDateTime pickupDateTime;
    private LocalDateTime returnDateTime;
    private String vehicleCategory;
    private Integer passengerCount;
    private String passengerName;
    private String passengerPhone;

    // Financials
    private BigDecimal totalFare;
    private BigDecimal vendorPayout;
    private BigDecimal advancePaid;
    private BigDecimal dueAmount;
    private String paymentStatus;
    private String paymentMethod;
    private String paymentProofUrl;
    private String paymentUtrNumber;
    private Instant paymentVerifiedAt;
    private String paymentVerifiedBy;
    private String paymentRejectionReason;
    private String couponCode;
    private BigDecimal couponDiscount;
    private Boolean isPetFriendly;
    private String petType;
    private Integer petCount;
    private BigDecimal petCharge;
    private BigDecimal vendorPetPayout;

    // Workflow status
    private BookingStatus status;
    private String specialInstructions;
    private String vendorDeclineReason;
    private String rideOtp;

    private Instant createdAt;
    private Instant updatedAt;

    // Trip Closing & Invoice Details
    private Double startKm;
    private Double endKm;
    private Double actualKm;
    private Double extraKm;
    private BigDecimal extraKmRate;
    private BigDecimal extraKmCharge;
    private BigDecimal tollCharges;
    private BigDecimal permitCharges;
    private BigDecimal parkingCharges;
    private BigDecimal driverAllowanceCharges;
    private BigDecimal otherCharges;
    private String otherChargesNotes;
    private String tripClosingNotes;
    private BigDecimal finalGst;
    private BigDecimal finalTotalFare;
    private String invoiceNumber;
    private Instant tripCompletedAt;
    private String tripClosedBy;

    // Customer Booked Route Distance
    private Integer distanceKm;

    public static BookingResponse fromEntity(Booking b) {
        if (b == null) return null;

        // Extract customer-side route distance from special_instructions or actual_km
        Integer dist = null;
        BigDecimal extractedRate = b.getExtraKmRate();
        if (b.getSpecialInstructions() != null) {
            java.util.regex.Matcher mDist = java.util.regex.Pattern.compile("Distance:\\s*(\\d+(\\.\\d+)?)\\s*km", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(b.getSpecialInstructions());
            if (mDist.find()) {
                try {
                    dist = (int) Math.round(Double.parseDouble(mDist.group(1)));
                } catch (Exception ignored) {}
            }

            if (extractedRate == null) {
                java.util.regex.Matcher mRate = java.util.regex.Pattern.compile("Rate:\\s*₹?(\\d+(\\.\\d+)?)", java.util.regex.Pattern.CASE_INSENSITIVE)
                        .matcher(b.getSpecialInstructions());
                if (mRate.find()) {
                    try {
                        extractedRate = new BigDecimal(mRate.group(1));
                    } catch (Exception ignored) {}
                }
            }
        }
        if (dist == null && b.getActualKm() != null && b.getActualKm() > 0) {
            dist = (int) Math.round(b.getActualKm());
        }

        BookingResponseBuilder builder = BookingResponse.builder()
                .id(b.getId())
                .distanceKm(dist)
                .extraKmRate(extractedRate)
                .bookingReference(b.getBookingReference())
                .customerId(b.getCustomer() != null ? b.getCustomer().getId() : null)
                .customerName(b.getCustomer() != null ? b.getCustomer().getName() : b.getPassengerName())
                .customerPhone(b.getCustomer() != null ? b.getCustomer().getPhone() : b.getPassengerPhone())
                .customerEmail(b.getCustomer() != null ? b.getCustomer().getEmail() : null)
                .tripType(b.getTripType())
                .pickupCity(b.getPickupCity())
                .dropCity(b.getDropCity())
                .stops(b.getStops())
                .pickupAddress(b.getPickupAddress())
                .pickupLat(b.getPickupLat())
                .pickupLng(b.getPickupLng())
                .pickupDoorNo(b.getPickupDoorNo())
                .pickupStreet(b.getPickupStreet())
                .pickupArea(b.getPickupArea())
                .pickupLandmark(b.getPickupLandmark())
                .pickupPincode(b.getPickupPincode())
                .dropAddress(b.getDropAddress())
                .pickupDateTime(b.getPickupDateTime())
                .returnDateTime(b.getReturnDateTime())
                .vehicleCategory(b.getVehicleCategory())
                .passengerCount(b.getPassengerCount())
                .passengerName(b.getPassengerName())
                .passengerPhone(b.getPassengerPhone())
                .totalFare(b.getTotalFare())
                .vendorPayout(b.getVendorPayout())
                .advancePaid(b.getAdvancePaid())
                .dueAmount(b.getDueAmount())
                .paymentStatus(b.getPaymentStatus())
                .paymentMethod(b.getPaymentMethod())
                .paymentProofUrl(b.getPaymentProofUrl())
                .paymentUtrNumber(b.getPaymentUtrNumber())
                .paymentVerifiedAt(b.getPaymentVerifiedAt())
                .paymentVerifiedBy(b.getPaymentVerifiedBy())
                .paymentRejectionReason(b.getPaymentRejectionReason())
                .couponCode(b.getCouponCode())
                .couponDiscount(b.getCouponDiscount())
                .isPetFriendly(b.getIsPetFriendly())
                .petType(b.getPetType())
                .petCount(b.getPetCount())
                .petCharge(b.getPetCharge())
                .vendorPetPayout(b.getVendorPetPayout())
                .status(b.getStatus())
                .specialInstructions(b.getSpecialInstructions())
                .vendorDeclineReason(b.getVendorDeclineReason())
                .startKm(b.getStartKm())
                .endKm(b.getEndKm())
                .actualKm(b.getActualKm())
                .extraKm(b.getExtraKm())
                .extraKmRate(b.getExtraKmRate())
                .extraKmCharge(b.getExtraKmCharge())
                .tollCharges(b.getTollCharges())
                .permitCharges(b.getPermitCharges())
                .parkingCharges(b.getParkingCharges())
                .driverAllowanceCharges(b.getDriverAllowanceCharges())
                .otherCharges(b.getOtherCharges())
                .otherChargesNotes(b.getOtherChargesNotes())
                .tripClosingNotes(b.getTripClosingNotes())
                .finalGst(b.getFinalGst())
                .finalTotalFare(b.getFinalTotalFare())
                .invoiceNumber(b.getInvoiceNumber())
                .tripCompletedAt(b.getTripCompletedAt())
                .tripClosedBy(b.getTripClosedBy())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt());

        // Vendor
        User vendor = b.getVendor();
        if (vendor == null && b.getAssignedVehicle() != null && b.getAssignedVehicle().getUser() != null) {
            vendor = b.getAssignedVehicle().getUser();
        }
        if (vendor != null) {
            String vPhone = (vendor.getPhone() != null && !vendor.getPhone().isBlank()) 
                    ? vendor.getPhone() 
                    : vendor.getAlternatePhone();
            builder.vendorId(vendor.getId())
                   .vendorBusinessName(vendor.getBusinessName() != null ? vendor.getBusinessName() : vendor.getName())
                   .vendorName(vendor.getName())
                   .vendorPhone(vPhone);
        }

        // Vehicle
        if (b.getAssignedVehicle() != null) {
            builder.vehicleId(b.getAssignedVehicle().getId())
                   .vehicleModel(b.getAssignedVehicle().getModel())
                   .vehicleNumber(b.getAssignedVehicle().getVehicleNumber())
                   .vehicleType(b.getAssignedVehicle().getVehicleType());
        }

        // Driver
        if (b.getAssignedDriver() != null) {
            builder.driverId(b.getAssignedDriver().getId())
                   .driverName(b.getAssignedDriver().getName())
                   .driverPhone(b.getAssignedDriver().getPhone());
        }

        // Only reveal ride OTP if booking is confirmed or on the way
        if (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.ON_THE_WAY || b.getStatus() == BookingStatus.IN_TRANSIT) {
            builder.rideOtp(b.getRideOtp());
        }

        return builder.build();
    }

    /**
     * Masks the customer total fare so the assigned vendor strictly sees only their contracted vendor payout amount.
     */
    public static BookingResponse fromEntityForVendor(Booking b) {
        if (b == null) return null;
        BookingResponse resp = fromEntity(b);
        BigDecimal payout = b.getVendorPayout() != null ? b.getVendorPayout() : b.getTotalFare();
        resp.setTotalFare(b.getFinalTotalFare() != null ? b.getFinalTotalFare() : (b.getTotalFare() != null ? b.getTotalFare() : payout));
        resp.setVendorPayout(payout);
        resp.setDueAmount(b.getDueAmount() != null ? b.getDueAmount() : payout);
        return resp;
    }
}

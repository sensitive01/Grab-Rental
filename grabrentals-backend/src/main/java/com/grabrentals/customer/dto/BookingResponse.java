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
    private String invoicePdfUrl;
    private Instant tripCompletedAt;
    private String tripClosedBy;
    private String endOdometerProofUrl;
    private String startOdometerProofUrl;

    // Customer Booked Route Distance
    private Integer distanceKm;
    private java.util.List<BookingAddonItem> addons;

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
                .invoicePdfUrl(b.getInvoicePdfUrl())
                .tripCompletedAt(b.getTripCompletedAt())
                .tripClosedBy(b.getTripClosedBy())
                .endOdometerProofUrl(b.getEndOdometerProofUrl())
                .startOdometerProofUrl(b.getStartOdometerProofUrl())
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

        builder.addons(extractAddons(b));
        return builder.build();
    }

    public static java.util.List<BookingAddonItem> extractAddons(Booking b) {
        java.util.List<BookingAddonItem> list = new java.util.ArrayList<>();
        if (b == null) return list;

        String spec = b.getSpecialInstructions() != null ? b.getSpecialInstructions() : "";

        // 1. Language Chauffeur
        if (spec.toLowerCase().contains("language chauffeur") || spec.toLowerCase().contains("language")) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("Language Chauffeur\\s*\\(([^)]+)\\)(?:\\s*\\([?₹](\\d+)\\))?", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(spec);
            String lang = "English";
            BigDecimal fee = new BigDecimal("199.00");
            if (m.find()) {
                if (m.group(1) != null && !m.group(1).isBlank()) lang = m.group(1).trim();
                if (m.group(2) != null) fee = new BigDecimal(m.group(2));
            }
            list.add(BookingAddonItem.builder()
                    .id("language_chauffeur")
                    .name("Language Chauffeur (" + lang + ")")
                    .description("Verified chauffeur fluent in " + lang)
                    .sacCode("9966")
                    .packageQty("1 Chauffeur")
                    .price(fee)
                    .emoji("🗣️")
                    .build());
        }

        // 2. Luggage Carrier / Roof Carrier
        if (spec.toLowerCase().contains("luggage carrier") || spec.toLowerCase().contains("roof carrier")) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("Luggage Carrier[^?₹)]*[?₹](\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(spec);
            BigDecimal fee = new BigDecimal("249.00");
            if (m.find()) {
                fee = new BigDecimal(m.group(1));
            }
            list.add(BookingAddonItem.builder()
                    .id("luggage_carrier")
                    .name("Luggage / Roof Top Carrier")
                    .description("Mounted carrier for extra luggage capacity")
                    .sacCode("9966")
                    .packageQty("1 Unit")
                    .price(fee)
                    .emoji("🧳")
                    .build());
        }

        // 3. Vehicle < 3 Years Old
        if (spec.toLowerCase().contains("less than 3 years") || spec.toLowerCase().contains("< 3 years")) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("Less than 3 years[^?₹)]*[?₹](\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(spec);
            BigDecimal fee = new BigDecimal("299.00");
            if (m.find()) {
                fee = new BigDecimal(m.group(1));
            }
            list.add(BookingAddonItem.builder()
                    .id("less_than_3_years")
                    .name("Guaranteed Car < 3 Years Old")
                    .description("Pristine, latest model commercial vehicle")
                    .sacCode("9966")
                    .packageQty("1 Vehicle")
                    .price(fee)
                    .emoji("✨")
                    .build());
        }

        // 4. Expressway FASTag Included
        if (spec.toLowerCase().contains("expressway fastag") || spec.toLowerCase().contains("expressway toll")) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("Expressway Fastag[^?₹)]*[?₹](\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(spec);
            BigDecimal fee = new BigDecimal("415.00");
            if (m.find()) {
                fee = new BigDecimal(m.group(1));
            }
            list.add(BookingAddonItem.builder()
                    .id("expressway")
                    .name("Expressway FASTag Toll Pass")
                    .description("Prepaid express highway fastag permit")
                    .sacCode("9966")
                    .packageQty("1 Trip")
                    .price(fee)
                    .emoji("🛣️")
                    .build());
        }

        // 5. Pet Friendly Accommodation
        boolean isPet = Boolean.TRUE.equals(b.getIsPetFriendly()) || spec.contains("Pet Friendly Cab") || spec.contains("Pet Fee");
        if (isPet) {
            String pType = b.getPetType() != null && !b.getPetType().isBlank() ? b.getPetType() : "Pet";
            int pCount = b.getPetCount() != null && b.getPetCount() > 0 ? b.getPetCount() : 1;
            BigDecimal pCharge = b.getPetCharge() != null && b.getPetCharge().compareTo(BigDecimal.ZERO) > 0 ? b.getPetCharge() : BigDecimal.ZERO;
            list.add(BookingAddonItem.builder()
                    .id("pet_friendly")
                    .name("Pet Friendly Accommodation (" + pType + " × " + pCount + ")")
                    .description("Cabin seat protector & pet sanitization package")
                    .sacCode("9966")
                    .packageQty("1 Surcharge")
                    .price(pCharge)
                    .emoji("🐾")
                    .build());
        }

        return list;
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

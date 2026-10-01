package com.grabrentals.customer.dto;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
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
    private String dropAddress;
    private LocalDateTime pickupDateTime;
    private LocalDateTime returnDateTime;
    private String vehicleCategory;
    private Integer passengerCount;
    private String passengerName;
    private String passengerPhone;

    // Financials
    private BigDecimal totalFare;
    private BigDecimal advancePaid;
    private BigDecimal dueAmount;
    private String paymentStatus;

    // Workflow status
    private BookingStatus status;
    private String specialInstructions;
    private String vendorDeclineReason;
    private String rideOtp;

    private Instant createdAt;
    private Instant updatedAt;

    public static BookingResponse fromEntity(Booking b) {
        if (b == null) return null;

        BookingResponseBuilder builder = BookingResponse.builder()
                .id(b.getId())
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
                .dropAddress(b.getDropAddress())
                .pickupDateTime(b.getPickupDateTime())
                .returnDateTime(b.getReturnDateTime())
                .vehicleCategory(b.getVehicleCategory())
                .passengerCount(b.getPassengerCount())
                .passengerName(b.getPassengerName())
                .passengerPhone(b.getPassengerPhone())
                .totalFare(b.getTotalFare())
                .advancePaid(b.getAdvancePaid())
                .dueAmount(b.getDueAmount())
                .paymentStatus(b.getPaymentStatus())
                .status(b.getStatus())
                .specialInstructions(b.getSpecialInstructions())
                .vendorDeclineReason(b.getVendorDeclineReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt());

        // Vendor
        if (b.getVendor() != null) {
            builder.vendorId(b.getVendor().getId())
                   .vendorBusinessName(b.getVendor().getBusinessName() != null ? b.getVendor().getBusinessName() : b.getVendor().getName())
                   .vendorName(b.getVendor().getName())
                   .vendorPhone(b.getVendor().getPhone());
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
}

package com.grabrentals.customer.entity;

import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_bookings_ref", columnList = "booking_reference", unique = true),
        @Index(name = "idx_bookings_customer_id", columnList = "customer_id"),
        @Index(name = "idx_bookings_vendor_id", columnList = "vendor_id"),
        @Index(name = "idx_bookings_status", columnList = "status"),
        @Index(name = "idx_bookings_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 32)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle assignedVehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver assignedDriver;

    @Column(name = "trip_type", nullable = false, length = 50)
    private String tripType;

    @Column(name = "pickup_city", nullable = false, length = 100)
    private String pickupCity;

    @Column(name = "drop_city", length = 100)
    private String dropCity;

    @Column(name = "stops", length = 500)
    private String stops;

    @Column(name = "pickup_address", nullable = false, columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_lng")
    private Double pickupLng;

    @Column(name = "pickup_door_no", length = 150)
    private String pickupDoorNo;

    @Column(name = "pickup_street", length = 255)
    private String pickupStreet;

    @Column(name = "pickup_area", length = 150)
    private String pickupArea;

    @Column(name = "pickup_landmark", length = 255)
    private String pickupLandmark;

    @Column(name = "pickup_pincode", length = 20)
    private String pickupPincode;

    @Column(name = "drop_address", columnDefinition = "TEXT")
    private String dropAddress;

    @Column(name = "pickup_datetime", nullable = false)
    private LocalDateTime pickupDateTime;

    @Column(name = "return_datetime")
    private LocalDateTime returnDateTime;

    @Column(name = "vehicle_category", nullable = false, length = 50)
    private String vehicleCategory;

    @Column(name = "passenger_count")
    private Integer passengerCount;

    @Column(name = "passenger_name", length = 100)
    private String passengerName;

    @Column(name = "passenger_phone", length = 25)
    private String passengerPhone;

    @Column(name = "total_fare", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalFare;

    @Column(name = "vendor_payout", precision = 12, scale = 2)
    private BigDecimal vendorPayout;

    @Column(name = "advance_paid", precision = 12, scale = 2)
    private BigDecimal advancePaid;

    @Column(name = "due_amount", precision = 12, scale = 2)
    private BigDecimal dueAmount;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_proof_url", columnDefinition = "TEXT")
    private String paymentProofUrl;

    @Column(name = "payment_utr_number", length = 100)
    private String paymentUtrNumber;

    @Column(name = "payment_verified_at")
    private Instant paymentVerifiedAt;

    @Column(name = "payment_verified_by", length = 150)
    private String paymentVerifiedBy;

    @Column(name = "payment_rejection_reason", columnDefinition = "TEXT")
    private String paymentRejectionReason;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "coupon_discount", precision = 12, scale = 2)
    private BigDecimal couponDiscount;

    @Column(name = "is_pet_friendly")
    @Builder.Default
    private Boolean isPetFriendly = false;

    @Column(name = "pet_type", length = 100)
    private String petType;

    @Column(name = "pet_count")
    @Builder.Default
    private Integer petCount = 1;

    @Column(name = "pet_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal petCharge = BigDecimal.ZERO;

    @Column(name = "vendor_pet_payout", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal vendorPetPayout = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private BookingStatus status;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "vendor_decline_reason", length = 500)
    private String vendorDeclineReason;

    @Column(name = "ride_otp", length = 10)
    private String rideOtp;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

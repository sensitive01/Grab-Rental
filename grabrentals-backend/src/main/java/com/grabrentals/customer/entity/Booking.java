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

    @Column(name = "pickup_address", nullable = false, length = 300)
    private String pickupAddress;

    @Column(name = "drop_address", length = 300)
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

    @Column(name = "advance_paid", precision = 12, scale = 2)
    private BigDecimal advancePaid;

    @Column(name = "due_amount", precision = 12, scale = 2)
    private BigDecimal dueAmount;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private BookingStatus status;

    @Column(name = "special_instructions", length = 500)
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

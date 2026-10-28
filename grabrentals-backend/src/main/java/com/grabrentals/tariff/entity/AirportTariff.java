package com.grabrentals.tariff.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "airport_tariffs",
    indexes = {
        @Index(name = "idx_at_city_state", columnList = "state, city"),
        @Index(name = "idx_at_trip_pricing", columnList = "trip_direction, pricing_type"),
        @Index(name = "idx_at_cat_seat", columnList = "category, seating_capacity"),
        @Index(name = "idx_at_km_range", columnList = "min_km, max_km"),
        @Index(name = "idx_at_status", columnList = "status")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AirportTariff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // CITY_TO_AIRPORT (Drop), AIRPORT_TO_CITY (Pickup), or BOTH
    @Column(name = "trip_direction", nullable = false, length = 50)
    @Builder.Default
    private String tripDirection = "BOTH";

    // REGULAR or SEASONAL
    @Column(name = "pricing_type", nullable = false, length = 50)
    @Builder.Default
    private String pricingType = "REGULAR";

    @Column(name = "title", length = 150)
    private String title;

    @Column(name = "state", length = 100)
    private String state; // e.g. "Tamil Nadu", "Karnataka"

    @Column(name = "city", length = 100)
    private String city; // e.g. "Chennai", "Bangalore", "Coimbatore"

    @Column(name = "airport_name", length = 200)
    @Builder.Default
    private String airportName = "ALL"; // e.g. "Kempegowda International Airport (BLR)" or "ALL"

    // Distance slab (in KM)
    @Column(name = "min_km", nullable = false)
    @Builder.Default
    private Integer minKm = 0;

    @Column(name = "max_km", nullable = false)
    private Integer maxKm; // e.g. 35, 50, 75

    // Vehicle specifications
    @Column(name = "category", nullable = false, length = 100)
    private String category; // e.g. "Sedan", "Hatchback", "SUV", "Innova"

    @Column(name = "model_name", length = 150)
    @Builder.Default
    private String modelName = "ALL";

    @Column(name = "seating_capacity", length = 50)
    @Builder.Default
    private String seatingCapacity = "4";

    @Column(name = "fuel_type", length = 50)
    @Builder.Default
    private String fuelType = "ALL";

    // Fares
    @Column(name = "customer_fare", precision = 10, scale = 2, nullable = false)
    private BigDecimal customerFare;

    @Column(name = "vendor_fare", precision = 10, scale = 2)
    private BigDecimal vendorFare;

    @Column(name = "extra_km_rate", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extraKmRate = BigDecimal.ZERO;

    @Column(name = "vendor_extra_km_rate", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal vendorExtraKmRate = BigDecimal.ZERO;

    // Day of week condition: e.g. "ALL" or comma-separated "MON,TUE,WED,THU,FRI,SAT,SUN"
    @Column(name = "days_of_week", length = 100)
    @Builder.Default
    private String daysOfWeek = "ALL";

    // Time condition: "ALL_DAY", "DAY", "NIGHT", "CUSTOM"
    @Column(name = "time_slot_type", length = 50)
    @Builder.Default
    private String timeSlotType = "ALL_DAY";

    @Column(name = "time_range_start", length = 10)
    private String timeRangeStart; // e.g. "06:00"

    @Column(name = "time_range_end", length = 10)
    private String timeRangeEnd; // e.g. "22:00"

    // Validity / Expiry: "NEVER" or "FIXED_DAYS"
    @Column(name = "expiry_type", length = 50)
    @Builder.Default
    private String expiryType = "NEVER";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Status: "ACTIVE" or "INACTIVE"
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "toll_included")
    @Builder.Default
    private Boolean tollIncluded = false;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "pet_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal petCharge = BigDecimal.ZERO;

    @Column(name = "vendor_pet_charge", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal vendorPetCharge = BigDecimal.ZERO;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

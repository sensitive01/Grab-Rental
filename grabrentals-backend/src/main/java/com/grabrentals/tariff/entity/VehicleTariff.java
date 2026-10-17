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
    name = "vehicle_tariffs",
    indexes = {
        @Index(name = "idx_vt_cat_model_seat", columnList = "category, model_name, seating_capacity"),
        @Index(name = "idx_vt_fuel", columnList = "fuel_type"),
        @Index(name = "idx_vt_dates", columnList = "is_seasonal, start_date, end_date")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VehicleTariff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "model_name", nullable = false, length = 150)
    private String modelName;

    @Column(name = "seating_capacity", nullable = false, length = 50)
    private String seatingCapacity;

    @Column(name = "fuel_type", length = 50)
    @Builder.Default
    private String fuelType = "Diesel";

    @Column(name = "is_seasonal", nullable = false)
    @Builder.Default
    private Boolean seasonal = false;

    @Column(name = "season_name", length = 150)
    private String seasonName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "service_type", length = 50)
    @Builder.Default
    private String serviceType = "OUTSTATION"; // OUTSTATION, HOURLY, AIRPORT

    @Column(name = "state", length = 100)
    private String state; // e.g. "Tamil Nadu", "Karnataka", or "ALL"

    @Column(name = "city", length = 100)
    private String city; // e.g. "Theni", "Coimbatore", "Bangalore", or "ALL"

    // Rates per 1 KM (Customer)
    @Column(name = "weekday_day_rate", precision = 10, scale = 2)
    private BigDecimal weekdayDayRate;

    @Column(name = "weekday_night_rate", precision = 10, scale = 2)
    private BigDecimal weekdayNightRate;

    @Column(name = "weekend_day_rate", precision = 10, scale = 2)
    private BigDecimal weekendDayRate;

    @Column(name = "weekend_night_rate", precision = 10, scale = 2)
    private BigDecimal weekendNightRate;

    // Rates per 1 KM (Vendor Payout)
    @Column(name = "vendor_weekday_day_rate", precision = 10, scale = 2)
    private BigDecimal vendorWeekdayDayRate;

    @Column(name = "vendor_weekday_night_rate", precision = 10, scale = 2)
    private BigDecimal vendorWeekdayNightRate;

    @Column(name = "vendor_weekend_day_rate", precision = 10, scale = 2)
    private BigDecimal vendorWeekendDayRate;

    @Column(name = "vendor_weekend_night_rate", precision = 10, scale = 2)
    private BigDecimal vendorWeekendNightRate;

    // Outstation base components (Customer)
    @Column(name = "base_fare", precision = 10, scale = 2)
    private BigDecimal baseFare;

    @Column(name = "base_included_km")
    private Integer baseIncludedKm;

    @Column(name = "driver_batta_day", precision = 10, scale = 2)
    private BigDecimal driverBattaDay;

    @Column(name = "driver_batta_night", precision = 10, scale = 2)
    private BigDecimal driverBattaNight;

    // Outstation base components (Vendor)
    @Column(name = "vendor_base_fare", precision = 10, scale = 2)
    private BigDecimal vendorBaseFare;

    @Column(name = "vendor_driver_batta_day", precision = 10, scale = 2)
    private BigDecimal vendorDriverBattaDay;

    @Column(name = "vendor_driver_batta_night", precision = 10, scale = 2)
    private BigDecimal vendorDriverBattaNight;

    // Hourly / Local Package components
    @Column(name = "package_hours")
    private Integer packageHours; // e.g. 4, 8, 12

    @Column(name = "package_km")
    private Integer packageKm; // e.g. 40, 80, 120

    @Column(name = "hourly_weekday_day_rate", precision = 10, scale = 2)
    private BigDecimal hourlyWeekdayDayRate;

    @Column(name = "hourly_vendor_weekday_day_rate", precision = 10, scale = 2)
    private BigDecimal hourlyVendorWeekdayDayRate;

    @Column(name = "hourly_weekday_night_rate", precision = 10, scale = 2)
    private BigDecimal hourlyWeekdayNightRate;

    @Column(name = "hourly_vendor_weekday_night_rate", precision = 10, scale = 2)
    private BigDecimal hourlyVendorWeekdayNightRate;

    @Column(name = "hourly_weekend_day_rate", precision = 10, scale = 2)
    private BigDecimal hourlyWeekendDayRate;

    @Column(name = "hourly_vendor_weekend_day_rate", precision = 10, scale = 2)
    private BigDecimal hourlyVendorWeekendDayRate;

    @Column(name = "hourly_weekend_night_rate", precision = 10, scale = 2)
    private BigDecimal hourlyWeekendNightRate;

    @Column(name = "hourly_vendor_weekend_night_rate", precision = 10, scale = 2)
    private BigDecimal hourlyVendorWeekendNightRate;

    @Column(name = "hourly_customer_fare", precision = 10, scale = 2)
    private BigDecimal hourlyCustomerFare;

    @Column(name = "hourly_vendor_fare", precision = 10, scale = 2)
    private BigDecimal hourlyVendorFare;

    @Column(name = "hourly_customer_weekend_fare", precision = 10, scale = 2)
    private BigDecimal hourlyCustomerWeekendFare;

    @Column(name = "hourly_vendor_weekend_fare", precision = 10, scale = 2)
    private BigDecimal hourlyVendorWeekendFare;

    @Column(name = "extra_km_rate", precision = 10, scale = 2)
    private BigDecimal extraKmRate;

    @Column(name = "vendor_extra_km_rate", precision = 10, scale = 2)
    private BigDecimal vendorExtraKmRate;

    @Column(name = "extra_hour_rate", precision = 10, scale = 2)
    private BigDecimal extraHourRate;

    @Column(name = "vendor_extra_hour_rate", precision = 10, scale = 2)
    private BigDecimal vendorExtraHourRate;

    // Airport Transfer components
    @Column(name = "airport_customer_fare", precision = 10, scale = 2)
    private BigDecimal airportCustomerFare;

    @Column(name = "airport_vendor_fare", precision = 10, scale = 2)
    private BigDecimal airportVendorFare;

    @Column(name = "airport_customer_weekend_fare", precision = 10, scale = 2)
    private BigDecimal airportCustomerWeekendFare;

    @Column(name = "airport_vendor_weekend_fare", precision = 10, scale = 2)
    private BigDecimal airportVendorWeekendFare;

    @Column(name = "airport_included_km")
    private Integer airportIncludedKm; // e.g. 35

    @Column(name = "airport_extra_km_rate", precision = 10, scale = 2)
    private BigDecimal airportExtraKmRate;

    @Column(name = "airport_vendor_extra_km_rate", precision = 10, scale = 2)
    private BigDecimal airportVendorExtraKmRate;

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

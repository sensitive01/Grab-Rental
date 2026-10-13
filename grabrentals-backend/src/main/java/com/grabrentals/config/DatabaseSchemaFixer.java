package com.grabrentals.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Running DatabaseSchemaFixer to ensure columns support multi-city and text URLs...");

        executeSafe("ALTER TABLE users ALTER COLUMN city TYPE TEXT");
        executeSafe("ALTER TABLE users ALTER COLUMN alternate_phone TYPE VARCHAR(255)");
        executeSafe("ALTER TABLE customer_profiles ALTER COLUMN city TYPE TEXT");
        executeSafe("ALTER TABLE customer_profiles ALTER COLUMN alternate_phone TYPE VARCHAR(255)");

        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN address TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN id_proof_document_url TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN address_proof_document_url TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN business_proof_document_url TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN gst_document_url TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN pan_document_url TYPE TEXT");
        executeSafe("ALTER TABLE fleet_profiles ALTER COLUMN bank_proof_document_url TYPE TEXT");

        // Vehicle Tariffs & Bookings updates for Multi-Service (Outstation, Hourly, Airport) and Dual Pricing (Customer & Vendor)
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'OUTSTATION'");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_weekday_day_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_weekday_night_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_weekend_day_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_weekend_night_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_base_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_driver_batta_day NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_driver_batta_night NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS package_hours INTEGER");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS package_km INTEGER");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS hourly_customer_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS hourly_vendor_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS hourly_customer_weekend_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS hourly_vendor_weekend_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS extra_km_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_extra_km_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS extra_hour_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_extra_hour_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_customer_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_vendor_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_customer_weekend_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_vendor_weekend_fare NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_included_km INTEGER");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_extra_km_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS airport_vendor_extra_km_rate NUMERIC(10,2)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS toll_included BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS state VARCHAR(100)");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS city VARCHAR(100)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_payout NUMERIC(12,2)");

        // Set default vendor rates for existing tariffs if empty (75% of customer rates by default)
        executeSafe("UPDATE vehicle_tariffs SET service_type = 'OUTSTATION' WHERE service_type IS NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekday_day_rate = ROUND(weekday_day_rate * 0.75, 2) WHERE vendor_weekday_day_rate IS NULL AND weekday_day_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekday_night_rate = ROUND(weekday_night_rate * 0.75, 2) WHERE vendor_weekday_night_rate IS NULL AND weekday_night_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekend_day_rate = ROUND(weekend_day_rate * 0.75, 2) WHERE vendor_weekend_day_rate IS NULL AND weekend_day_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekend_night_rate = ROUND(weekend_night_rate * 0.75, 2) WHERE vendor_weekend_night_rate IS NULL AND weekend_night_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_base_fare = ROUND(base_fare * 0.75, 2) WHERE vendor_base_fare IS NULL AND base_fare IS NOT NULL");

        // Ensure distinct dynamic rates for vehicle categories in tariffs
        executeSafe("UPDATE vehicle_tariffs SET weekday_day_rate = 16.00, weekday_night_rate = 18.00, weekend_day_rate = 18.00, weekend_night_rate = 20.00, base_fare = 4500.00 WHERE LOWER(model_name) LIKE '%ertiga%' AND is_seasonal = false");
        executeSafe("UPDATE vehicle_tariffs SET weekday_day_rate = 11.50, weekday_night_rate = 12.50, weekend_day_rate = 12.50, weekend_night_rate = 14.00, base_fare = 2800.00 WHERE LOWER(model_name) LIKE '%wagon%' AND is_seasonal = false");
        log.info("DatabaseSchemaFixer column verification completed.");
    }

    private void executeSafe(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            log.warn("DatabaseSchemaFixer note for '{}': {}", sql, ex.getMessage());
        }
    }
}

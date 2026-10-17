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
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS pet_charge NUMERIC(10,2) DEFAULT 0");
        executeSafe("ALTER TABLE vehicle_tariffs ADD COLUMN IF NOT EXISTS vendor_pet_charge NUMERIC(10,2) DEFAULT 0");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_payout NUMERIC(12,2)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pet_type VARCHAR(100)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pet_count INTEGER DEFAULT 1");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pet_charge NUMERIC(10,2) DEFAULT 0");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_pet_payout NUMERIC(10,2) DEFAULT 0");
        executeSafe("ALTER TABLE pricing_tax_configs ADD COLUMN IF NOT EXISTS default_pet_charge NUMERIC(10,2) DEFAULT 499.00");
        executeSafe("ALTER TABLE pricing_tax_configs ADD COLUMN IF NOT EXISTS default_vendor_pet_charge NUMERIC(10,2) DEFAULT 350.00");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lat NUMERIC(10, 6)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_lng NUMERIC(10, 6)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_door_no VARCHAR(150)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_street VARCHAR(255)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_area VARCHAR(150)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_landmark VARCHAR(255)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_pincode VARCHAR(20)");

        // Set default vendor rates for existing tariffs if empty (75% of customer rates by default)
        executeSafe("UPDATE vehicle_tariffs SET service_type = 'OUTSTATION' WHERE service_type IS NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekday_day_rate = ROUND(weekday_day_rate * 0.75, 2) WHERE vendor_weekday_day_rate IS NULL AND weekday_day_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekday_night_rate = ROUND(weekday_night_rate * 0.75, 2) WHERE vendor_weekday_night_rate IS NULL AND weekday_night_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekend_day_rate = ROUND(weekend_day_rate * 0.75, 2) WHERE vendor_weekend_day_rate IS NULL AND weekend_day_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_weekend_night_rate = ROUND(weekend_night_rate * 0.75, 2) WHERE vendor_weekend_night_rate IS NULL AND weekend_night_rate IS NOT NULL");
        executeSafe("UPDATE vehicle_tariffs SET vendor_base_fare = ROUND(base_fare * 0.75, 2) WHERE vendor_base_fare IS NULL AND base_fare IS NOT NULL");

        // Ensure distinct dynamic rates for vehicle categories in tariffs
        executeSafe("UPDATE vehicle_tariffs SET weekday_day_rate = 16.00, weekday_night_rate = 18.00, weekend_day_rate = 18.00, weekend_night_rate = 20.00, base_fare = 4500.00 WHERE LOWER(model_name) LIKE '%ertiga%' AND is_seasonal = false");
        // Ensure coupon columns exist on bookings
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10,2)");

        // Backfill coupon fields for bookings that used coupons in specialInstructions
        executeSafe("UPDATE bookings SET coupon_code = 'SUMMEROFF20', coupon_discount = 500.00 WHERE special_instructions LIKE '%SUMMEROFF20%' AND coupon_code IS NULL");

        // Sync used_count for SUMMEROFF20 if it was redeemed
        executeSafe("UPDATE coupons SET used_count = 1 WHERE UPPER(code) = 'SUMMEROFF20' AND (used_count IS NULL OR used_count = 0)");
        executeSafe("INSERT INTO coupon_redemptions (coupon_code, customer_phone, redeemed_at) SELECT 'SUMMEROFF20', '9856375450', NOW() WHERE NOT EXISTS (SELECT 1 FROM coupon_redemptions WHERE UPPER(coupon_code) = 'SUMMEROFF20')");

        // Ensure customer_profiles has ON DELETE CASCADE to allow clean user deletion
        executeSafe("ALTER TABLE customer_profiles DROP CONSTRAINT IF EXISTS fk69orkdj1un5rh845ngvvmd1xs");
        executeSafe("ALTER TABLE customer_profiles DROP CONSTRAINT IF EXISTS fk_customer_profiles_user");
        executeSafe("ALTER TABLE customer_profiles ADD CONSTRAINT fk_customer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");

        // Ensure payment proof and verification columns exist on bookings
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_proof_url TEXT");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_utr_number VARCHAR(100)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_verified_by VARCHAR(150)");
        executeSafe("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT");

        // Fix corrupted LOCAL hourly weekend fares where extra-hourly rate (e.g. 20) was mistakenly stored as package weekend fare
        executeSafe("UPDATE vehicle_tariffs SET hourly_customer_weekend_fare = hourly_customer_fare WHERE service_type = 'LOCAL' AND (hourly_customer_weekend_fare IS NULL OR hourly_customer_weekend_fare < 100) AND hourly_customer_fare >= 100");
        executeSafe("UPDATE vehicle_tariffs SET hourly_vendor_weekend_fare = hourly_vendor_fare WHERE service_type = 'LOCAL' AND (hourly_vendor_weekend_fare IS NULL OR hourly_vendor_weekend_fare < 100) AND hourly_vendor_fare >= 100");

        // Ensure bookings status check constraint includes PENDING_PAYMENT_VERIFICATION and columns allow text
        executeSafe("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check");
        executeSafe("ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status::text = ANY (ARRAY['PENDING_PAYMENT_VERIFICATION'::character varying, 'PENDING_ALLOCATION'::character varying, 'ASSIGNED_TO_VENDOR'::character varying, 'CONFIRMED'::character varying, 'REASSIGN_REQUIRED'::character varying, 'ON_THE_WAY'::character varying, 'IN_TRANSIT'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying]::text[]))");
        executeSafe("ALTER TABLE bookings ALTER COLUMN special_instructions TYPE TEXT");
        executeSafe("ALTER TABLE bookings ALTER COLUMN drop_address TYPE TEXT");
        executeSafe("ALTER TABLE bookings ALTER COLUMN pickup_address TYPE TEXT");

        // Ensure all coupons enforce per_user_limit = 1 by default
        executeSafe("UPDATE coupons SET per_user_limit = 1 WHERE per_user_limit IS NULL");
        executeSafe("UPDATE coupons SET target_audience = 'ALL_USERS' WHERE target_audience IS NULL");
        executeSafe("ALTER TABLE coupons ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'ALL'");
        executeSafe("ALTER TABLE coupons ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'ALL'");
        executeSafe("UPDATE coupons SET state = 'ALL' WHERE state IS NULL");
        executeSafe("UPDATE coupons SET city = 'ALL' WHERE city IS NULL");

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

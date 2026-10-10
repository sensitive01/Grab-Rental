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

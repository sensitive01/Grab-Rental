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

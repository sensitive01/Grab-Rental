package com.grabrentals.tariff;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.tariff.config.ChargesTariffSeeder;
import com.grabrentals.tariff.entity.VehicleTariff;
import com.grabrentals.tariff.service.VehicleTariffService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ChargesTariffIntegrationTest {

    private static List<ChargesTariffSeeder.ChargesRecord> matrixRecords;
    private static List<VehicleTariff> seededTariffs;

    @BeforeAll
    static void setup() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ClassPathResource resource = new ClassPathResource("data/charges_pricing_matrix.json");
        assertTrue(resource.exists(), "charges_pricing_matrix.json must exist in classpath");

        try (InputStream in = resource.getInputStream()) {
            matrixRecords = mapper.readValue(in, new TypeReference<List<ChargesTariffSeeder.ChargesRecord>>() {});
        }

        assertNotNull(matrixRecords);
        assertEquals(752, matrixRecords.size(), "Should have exactly 752 records from charges.xlsx");

        seededTariffs = new ArrayList<>();
        for (ChargesTariffSeeder.ChargesRecord r : matrixRecords) {
            List<ChargesTariffSeeder.VehicleTypeMapping> mappings = ChargesTariffSeeder.getMappingsForVehicleType(r.getVehicleType());
            assertFalse(mappings.isEmpty(), "Mapping must exist for " + r.getVehicleType());

            for (ChargesTariffSeeder.VehicleTypeMapping mapping : mappings) {
                seededTariffs.add(VehicleTariff.builder()
                        .serviceType("ONE_WAY")
                        .state(r.getState())
                        .city(r.getCity())
                        .category(mapping.category)
                        .modelName(mapping.modelName)
                        .seatingCapacity(mapping.seatingCapacity)
                        .fuelType(mapping.fuelType)
                        .seasonal(false)
                        .weekdayDayRate(BigDecimal.valueOf(r.getOneWayPerKm()))
                        .weekdayNightRate(BigDecimal.valueOf(r.getOneWayPerKm()))
                        .weekendDayRate(BigDecimal.valueOf(r.getOneWayPerKm()))
                        .weekendNightRate(BigDecimal.valueOf(r.getOneWayPerKm()))
                        .build());

                seededTariffs.add(VehicleTariff.builder()
                        .serviceType("OUTSTATION")
                        .state(r.getState())
                        .city(r.getCity())
                        .category(mapping.category)
                        .modelName(mapping.modelName)
                        .seatingCapacity(mapping.seatingCapacity)
                        .fuelType(mapping.fuelType)
                        .seasonal(false)
                        .weekdayDayRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekdayNightRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekendDayRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekendNightRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .build());

                seededTariffs.add(VehicleTariff.builder()
                        .serviceType("ROUND_TRIP")
                        .state(r.getState())
                        .city(r.getCity())
                        .category(mapping.category)
                        .modelName(mapping.modelName)
                        .seatingCapacity(mapping.seatingCapacity)
                        .fuelType(mapping.fuelType)
                        .seasonal(false)
                        .weekdayDayRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekdayNightRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekendDayRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .weekendNightRate(BigDecimal.valueOf(r.getOutstationPerKm()))
                        .build());
            }
        }

        // 752 matrix records: 94 cities * (8 types + 2 additional models for Hatchback and Sedan) = 94 * 10 = 940 per service type
        // 940 * 3 = 2820 total seeded tariffs
        assertEquals(940 * 3, seededTariffs.size(), "Should have 2820 total seeded tariffs including Swift and Etios");
    }

    @Test
    @DisplayName("Verify city dual name matching with slashes")
    void testCitySlashMatching() {
        assertTrue(VehicleTariffService.areCitiesEqual("Gurgaon", "Gurugram / Gurgaon"));
        assertTrue(VehicleTariffService.areCitiesEqual("Gurugram", "Gurugram / Gurgaon"));
        assertTrue(VehicleTariffService.areCitiesEqual("Prayagraj", "Allahabad / Prayagraj"));
        assertTrue(VehicleTariffService.areCitiesEqual("Allahabad", "Allahabad / Prayagraj"));
        assertTrue(VehicleTariffService.areCitiesEqual("Bhuj", "Kutch / Bhuj"));
        assertTrue(VehicleTariffService.areCitiesEqual("Tiruchirappalli", "Trichy / Tiruchirappalli"));
        assertTrue(VehicleTariffService.areCitiesEqual("Trichy", "Trichy / Tiruchirappalli"));
        assertTrue(VehicleTariffService.areCitiesEqual("Puducherry", "Pondicherry / Puducherry"));
    }

    @Test
    @DisplayName("Verify vehicle category normalization")
    void testCategoryNormalization() {
        assertTrue(VehicleTariffService.areCategoriesEqual("SUV / MUV", "SUV"));
        assertTrue(VehicleTariffService.areCategoriesEqual("Toyota Innova / Innova Crysta", "Innovacrysta"));
        assertTrue(VehicleTariffService.areCategoriesEqual("Innova Crysta", "Innovacrysta"));
        assertTrue(VehicleTariffService.areCategoriesEqual("Force Urbania", "urbania"));
        assertTrue(VehicleTariffService.areCategoriesEqual("Tempo Traveller", "Tempo"));
        assertTrue(VehicleTariffService.areCategoriesEqual("Bus / Minibus", "Bus"));
    }

    @Test
    @DisplayName("Verify rate calculation for Gurugram Hatchback One-way and Outstation")
    void testGurugramRates() {
        VehicleTariffService service = new VehicleTariffService(null, null, null);

        // One-way Gurugram Hatchback -> 10.0
        Map<String, Object> ow = service.calculateRate(
                "Hatchback", "WagonR", "4", "Petrol + CNG",
                "2026-11-05", "10:00", "ONE_WAY", "Gurgaon", "Haryana", null, seededTariffs
        );
        assertEquals(new BigDecimal("10.0"), ow.get("ratePerKm"));

        // Outstation Gurugram Hatchback -> 9.0
        Map<String, Object> ost = service.calculateRate(
                "Hatchback", "WagonR", "4", "Petrol + CNG",
                "2026-11-05", "10:00", "ROUND_TRIP", "Gurgaon", "Haryana", null, seededTariffs
        );
        assertEquals(new BigDecimal("9.0"), ost.get("ratePerKm"));

        // Gurugram Tempo Traveller Outstation -> 43.0
        Map<String, Object> tt = service.calculateRate(
                "Tempo", "Tempo Traveller", "12", "Diesel",
                "2026-11-05", "10:00", "ROUND_TRIP", "Gurugram", "Haryana", null, seededTariffs
        );
        assertEquals(new BigDecimal("43.0"), tt.get("ratePerKm"));
    }

    @Test
    @DisplayName("Verify rate calculation for Agra Sedan and Pune Urbania")
    void testAgraAndPuneRates() {
        VehicleTariffService service = new VehicleTariffService(null, null, null);

        // Agra Sedan One-way -> 11.0
        Map<String, Object> agraOw = service.calculateRate(
                "Sedan", "Dzire", "4", "CNG",
                "2026-11-05", "10:00", "ONE_WAY", "Agra", "Uttar Pradesh", null, seededTariffs
        );
        assertEquals(new BigDecimal("11.0"), agraOw.get("ratePerKm"));

        // Agra Sedan Outstation -> 10.0
        Map<String, Object> agraOst = service.calculateRate(
                "Sedan", "Dzire", "4", "CNG",
                "2026-11-05", "10:00", "ROUND_TRIP", "Agra", "Uttar Pradesh", null, seededTariffs
        );
        assertEquals(new BigDecimal("10.0"), agraOst.get("ratePerKm"));

        // Pune Urbania Outstation -> 42.0
        Map<String, Object> puneUrbania = service.calculateRate(
                "urbania", "Force Urbania", "12", "Diesel",
                "2026-11-05", "10:00", "ROUND_TRIP", "Pune", "Maharashtra", null, seededTariffs
        );
        assertEquals(new BigDecimal("42.0"), puneUrbania.get("ratePerKm"));
    }

    @Test
    @DisplayName("Verify rate calculation for Swift (Hatchback) and Etios (Sedan)")
    void testSwiftAndEtiosRates() {
        VehicleTariffService service = new VehicleTariffService(null, null, null);

        // Swift One-way Gurugram -> same Hatchback rate 10.0
        Map<String, Object> swiftOw = service.calculateRate(
                "Hatchback", "Swift", "4", "Petrol + CNG",
                "2026-11-05", "10:00", "ONE_WAY", "Gurgaon", "Haryana", null, seededTariffs
        );
        assertEquals(new BigDecimal("10.0"), swiftOw.get("ratePerKm"));

        // Swift Outstation Gurugram -> same Hatchback rate 9.0
        Map<String, Object> swiftOst = service.calculateRate(
                "Hatchback", "Swift", "4", "Petrol + CNG",
                "2026-11-05", "10:00", "ROUND_TRIP", "Gurugram", "Haryana", null, seededTariffs
        );
        assertEquals(new BigDecimal("9.0"), swiftOst.get("ratePerKm"));

        // Etios One-way Agra -> same Sedan rate 11.0
        Map<String, Object> etiosOw = service.calculateRate(
                "Sedan", "Etios", "4", "Diesel",
                "2026-11-05", "10:00", "ONE_WAY", "Agra", "Uttar Pradesh", null, seededTariffs
        );
        assertEquals(new BigDecimal("11.0"), etiosOw.get("ratePerKm"));

        // Etios Outstation Agra -> same Sedan rate 10.0
        Map<String, Object> etiosOst = service.calculateRate(
                "Sedan", "Etios", "4", "Diesel",
                "2026-11-05", "10:00", "ROUND_TRIP", "Agra", "Uttar Pradesh", null, seededTariffs
        );
        assertEquals(new BigDecimal("10.0"), etiosOst.get("ratePerKm"));
    }
}

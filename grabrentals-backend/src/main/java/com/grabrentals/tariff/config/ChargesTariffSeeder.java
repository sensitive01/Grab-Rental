package com.grabrentals.tariff.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.tariff.entity.VehicleModelConfig;
import com.grabrentals.tariff.entity.VehicleTariff;
import com.grabrentals.tariff.repository.VehicleModelConfigRepository;
import com.grabrentals.tariff.repository.VehicleTariffRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class ChargesTariffSeeder implements CommandLineRunner {

    private final VehicleTariffRepository tariffRepository;
    private final VehicleModelConfigRepository modelConfigRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.seed.tariff.enabled:true}")
    private boolean seedTariffEnabled;

    @Value("${app.seed.tariff.force:false}")
    private boolean seedTariffForce;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChargesRecord {
        private int sNo;
        private String vehicleType;
        private String state;
        private String city;
        private double oneWayPerKm;
        private double outstationPerKm;
    }

    public static class VehicleTypeMapping {
        public final String category;
        public final String modelName;
        public final String seatingCapacity;
        public final String fuelType;
        public final String commonPhotoUrl;
        public final BigDecimal driverBattaDay;
        public final BigDecimal driverBattaNight;

        public VehicleTypeMapping(String category, String modelName, String seatingCapacity, String fuelType,
                                  String commonPhotoUrl, BigDecimal driverBattaDay, BigDecimal driverBattaNight) {
            this.category = category;
            this.modelName = modelName;
            this.seatingCapacity = seatingCapacity;
            this.fuelType = fuelType;
            this.commonPhotoUrl = commonPhotoUrl;
            this.driverBattaDay = driverBattaDay;
            this.driverBattaNight = driverBattaNight;
        }
    }

    public static final Map<String, VehicleTypeMapping> TYPE_MAPPINGS = new LinkedHashMap<>();

    static {
        TYPE_MAPPINGS.put("Hatchback", new VehicleTypeMapping(
                "Hatchback", "WagonR", "4", "Petrol + CNG",
                "/images/cars/wagon_r.jpg", new BigDecimal("350.00"), new BigDecimal("250.00")
        ));
        TYPE_MAPPINGS.put("Sedan", new VehicleTypeMapping(
                "Sedan", "Dzire", "4", "CNG",
                "/images/cars/dzire.jpg", new BigDecimal("400.00"), new BigDecimal("300.00")
        ));
        TYPE_MAPPINGS.put("SUV / MUV", new VehicleTypeMapping(
                "SUV", "Ertiga", "6", "Diesel",
                "/images/cars/ertiga.jpg", new BigDecimal("450.00"), new BigDecimal("350.00")
        ));
        TYPE_MAPPINGS.put("Toyota Innova / Innova Crysta", new VehicleTypeMapping(
                "Innovacrysta", "Innova Crysta", "7", "Diesel",
                "/images/cars/innova.jpg", new BigDecimal("500.00"), new BigDecimal("400.00")
        ));
        TYPE_MAPPINGS.put("Innova Hycross", new VehicleTypeMapping(
                "innovahycross", "Innova Hycross", "7", "Hybrid",
                "/images/cars/innova.jpg", new BigDecimal("500.00"), new BigDecimal("400.00")
        ));
        TYPE_MAPPINGS.put("Tempo Traveller", new VehicleTypeMapping(
                "Tempo", "Tempo Traveller", "12", "Diesel",
                "/images/cars/tempo.jpg", new BigDecimal("600.00"), new BigDecimal("450.00")
        ));
        TYPE_MAPPINGS.put("Bus / Minibus", new VehicleTypeMapping(
                "Bus", "Luxury Bus", "35", "Diesel",
                "/images/cars/bus.jpg", new BigDecimal("800.00"), new BigDecimal("600.00")
        ));
        TYPE_MAPPINGS.put("Urbania", new VehicleTypeMapping(
                "urbania", "Force Urbania", "12", "Diesel",
                "/images/cars/urbania.jpg", new BigDecimal("650.00"), new BigDecimal("500.00")
        ));
    }

    public static final List<VehicleTypeMapping> ALL_CATALOG_MODELS = List.of(
            new VehicleTypeMapping("Hatchback", "WagonR", "4", "Petrol + CNG", "/images/cars/wagon_r.jpg", new BigDecimal("350.00"), new BigDecimal("250.00")),
            new VehicleTypeMapping("Hatchback", "Swift", "4", "Petrol + CNG", "/images/cars/wagon_r.jpg", new BigDecimal("350.00"), new BigDecimal("250.00")),
            new VehicleTypeMapping("Sedan", "Dzire", "4", "CNG", "/images/cars/dzire.jpg", new BigDecimal("400.00"), new BigDecimal("300.00")),
            new VehicleTypeMapping("Sedan", "Etios", "4", "Diesel", "/images/cars/dzire.jpg", new BigDecimal("400.00"), new BigDecimal("300.00")),
            new VehicleTypeMapping("SUV", "Ertiga", "6", "Diesel", "/images/cars/ertiga.jpg", new BigDecimal("450.00"), new BigDecimal("350.00")),
            new VehicleTypeMapping("Innovacrysta", "Innova Crysta", "7", "Diesel", "/images/cars/innova.jpg", new BigDecimal("500.00"), new BigDecimal("400.00")),
            new VehicleTypeMapping("innovahycross", "Innova Hycross", "7", "Hybrid", "/images/cars/innova.jpg", new BigDecimal("500.00"), new BigDecimal("400.00")),
            new VehicleTypeMapping("Tempo", "Tempo Traveller", "12", "Diesel", "/images/cars/tempo.jpg", new BigDecimal("600.00"), new BigDecimal("450.00")),
            new VehicleTypeMapping("Bus", "Luxury Bus", "26", "Diesel", "/images/cars/bus.jpg", new BigDecimal("700.00"), new BigDecimal("550.00")),
            new VehicleTypeMapping("Bus", "Luxury Bus", "35", "Diesel", "/images/cars/bus.jpg", new BigDecimal("800.00"), new BigDecimal("600.00")),
            new VehicleTypeMapping("urbania", "Force Urbania", "12", "Diesel", "/images/cars/urbania.jpg", new BigDecimal("650.00"), new BigDecimal("500.00"))
    );

    public static List<VehicleTypeMapping> getMappingsForVehicleType(String vehicleType) {
        if ("Hatchback".equalsIgnoreCase(vehicleType)) {
            return List.of(
                    TYPE_MAPPINGS.get("Hatchback"),
                    new VehicleTypeMapping("Hatchback", "Swift", "4", "Petrol + CNG", "/images/cars/wagon_r.jpg", new BigDecimal("350.00"), new BigDecimal("250.00"))
            );
        } else if ("Sedan".equalsIgnoreCase(vehicleType)) {
            return List.of(
                    TYPE_MAPPINGS.get("Sedan"),
                    new VehicleTypeMapping("Sedan", "Etios", "4", "Diesel", "/images/cars/dzire.jpg", new BigDecimal("400.00"), new BigDecimal("300.00"))
            );
        } else {
            VehicleTypeMapping m = TYPE_MAPPINGS.get(vehicleType);
            return m != null ? List.of(m) : Collections.emptyList();
        }
    }

    @Override
    public void run(String... args) {
        if (!seedTariffEnabled) {
            log.info("ChargesTariffSeeder: Tariff seeding is disabled by configuration (SEED_TARIFF_ENABLED=false).");
            return;
        }
        syncModelConfigs();
        syncChargesTariffs(seedTariffForce);
        backfillVendorRatesAndBaseFares();
    }

    public void backfillVendorRatesAndBaseFares() {
        try {
            String backfillSql = "UPDATE vehicle_tariffs SET " +
                    "vendor_weekday_day_rate = ROUND(weekday_day_rate * 0.80, 2), " +
                    "vendor_weekday_night_rate = ROUND(weekday_night_rate * 0.80, 2), " +
                    "vendor_weekend_day_rate = ROUND(weekend_day_rate * 0.80, 2), " +
                    "vendor_weekend_night_rate = ROUND(weekend_night_rate * 0.80, 2), " +
                    "base_included_km = CASE WHEN base_included_km IS NULL OR base_included_km = 0 THEN 250 ELSE base_included_km END, " +
                    "base_fare = CASE WHEN base_fare IS NULL OR base_fare = 0 THEN ROUND(weekday_day_rate * (CASE WHEN base_included_km IS NULL OR base_included_km = 0 THEN 250 ELSE base_included_km END), 2) ELSE base_fare END, " +
                    "vendor_base_fare = ROUND((CASE WHEN base_fare IS NULL OR base_fare = 0 THEN weekday_day_rate * (CASE WHEN base_included_km IS NULL OR base_included_km = 0 THEN 250 ELSE base_included_km END) ELSE base_fare END) * 0.80, 2), " +
                    "vendor_driver_batta_day = ROUND(COALESCE(driver_batta_day, 400) * 0.80, 2), " +
                    "vendor_driver_batta_night = ROUND(COALESCE(driver_batta_night, 300) * 0.80, 2)";
            int updated = jdbcTemplate.update(backfillSql);
            if (updated > 0) {
                log.info("ChargesTariffSeeder: Successfully updated vendor rates and base fares to 20% margin for {} tariff records.", updated);
            }
        } catch (Exception e) {
            log.warn("ChargesTariffSeeder: Could not execute vendor rate backfill: {}", e.getMessage());
        }
    }

    @Transactional
    public void syncModelConfigs() {
        for (VehicleTypeMapping m : ALL_CATALOG_MODELS) {
            Optional<VehicleModelConfig> existing = modelConfigRepository
                    .findByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacity(
                            m.category, m.modelName, m.seatingCapacity
                    );
            if (existing.isEmpty()) {
                VehicleModelConfig entity = VehicleModelConfig.builder()
                        .category(m.category)
                        .modelName(m.modelName)
                        .seatingCapacity(m.seatingCapacity)
                        .fuelType(m.fuelType)
                        .commonPhotoUrl(m.commonPhotoUrl)
                        .active(true)
                        .description("Standard " + m.category + " fleet model")
                        .build();
                modelConfigRepository.save(entity);
                log.info("ChargesTariffSeeder: Created model config {} / {}", m.category, m.modelName);
            }
        }
    }

    public void syncChargesTariffs(boolean force) {
        long oneWayCount = tariffRepository.countByServiceTypeIgnoreCase("ONE_WAY");
        if (!force && oneWayCount >= 940) {
            log.info("ChargesTariffSeeder: Found {} existing ONE_WAY tariffs. Skipping automatic seeding.", oneWayCount);
            backfillVendorRatesAndBaseFares();
            return;
        }

        log.info("ChargesTariffSeeder: Loading charges pricing matrix from classpath:data/charges_pricing_matrix.json ...");
        try {
            ClassPathResource res = new ClassPathResource("data/charges_pricing_matrix.json");
            if (!res.exists()) {
                log.warn("ChargesTariffSeeder: charges_pricing_matrix.json not found in classpath. Skipping.");
                return;
            }

            List<ChargesRecord> records;
            try (InputStream in = res.getInputStream()) {
                records = objectMapper.readValue(in, new TypeReference<List<ChargesRecord>>() {});
            }

            if (records == null || records.isEmpty()) {
                log.warn("ChargesTariffSeeder: No records found in charges_pricing_matrix.json.");
                return;
            }

            // If force re-seed or partial records exist, clean up prior matrix records
            if (force || oneWayCount > 0) {
                log.info("ChargesTariffSeeder: Cleaning previous matrix tariffs...");
                jdbcTemplate.update("DELETE FROM vehicle_tariffs WHERE service_type IN ('ONE_WAY', 'OUTSTATION', 'ROUND_TRIP')");
            }

            log.info("ChargesTariffSeeder: Batch inserting tariffs for {} city-vehicle rows...", records.size());

            List<VehicleTariff> tariffsToSave = new ArrayList<>(records.size() * 4);
            int baseKm = 250;

            for (ChargesRecord r : records) {
                List<VehicleTypeMapping> mappings = getMappingsForVehicleType(r.getVehicleType());
                if (mappings.isEmpty()) {
                    log.warn("ChargesTariffSeeder: Unknown vehicle type '{}'. Skipping.", r.getVehicleType());
                    continue;
                }

                for (VehicleTypeMapping mapping : mappings) {
                    BigDecimal oneWayRate = BigDecimal.valueOf(r.getOneWayPerKm());
                    BigDecimal oneWayVendorRate = oneWayRate.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal oneWayBaseFare = oneWayRate.multiply(BigDecimal.valueOf(baseKm)).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal oneWayVendorBaseFare = oneWayVendorRate.multiply(BigDecimal.valueOf(baseKm)).setScale(2, RoundingMode.HALF_UP);

                    BigDecimal outstationRate = BigDecimal.valueOf(r.getOutstationPerKm());
                    BigDecimal outstationVendorRate = outstationRate.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal outstationBaseFare = outstationRate.multiply(BigDecimal.valueOf(baseKm)).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal outstationVendorBaseFare = outstationVendorRate.multiply(BigDecimal.valueOf(baseKm)).setScale(2, RoundingMode.HALF_UP);

                    BigDecimal vendorBattaDay = mapping.driverBattaDay.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal vendorBattaNight = mapping.driverBattaNight.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);

                    // 1. ONE_WAY Tariff
                    tariffsToSave.add(VehicleTariff.builder()
                            .id(UUID.randomUUID())
                            .serviceType("ONE_WAY")
                            .state(r.getState())
                            .city(r.getCity())
                            .category(mapping.category)
                            .modelName(mapping.modelName)
                            .seatingCapacity(mapping.seatingCapacity)
                            .fuelType(mapping.fuelType)
                            .weekdayDayRate(oneWayRate)
                            .weekdayNightRate(oneWayRate)
                            .weekendDayRate(oneWayRate)
                            .weekendNightRate(oneWayRate)
                            .vendorWeekdayDayRate(oneWayVendorRate)
                            .vendorWeekdayNightRate(oneWayVendorRate)
                            .vendorWeekendDayRate(oneWayVendorRate)
                            .vendorWeekendNightRate(oneWayVendorRate)
                            .baseIncludedKm(baseKm)
                            .baseFare(oneWayBaseFare)
                            .vendorBaseFare(oneWayVendorBaseFare)
                            .driverBattaDay(mapping.driverBattaDay)
                            .driverBattaNight(mapping.driverBattaNight)
                            .vendorDriverBattaDay(vendorBattaDay)
                            .vendorDriverBattaNight(vendorBattaNight)
                            .build());

                    // 2. ROUND_TRIP Tariff
                    tariffsToSave.add(VehicleTariff.builder()
                            .id(UUID.randomUUID())
                            .serviceType("ROUND_TRIP")
                            .state(r.getState())
                            .city(r.getCity())
                            .category(mapping.category)
                            .modelName(mapping.modelName)
                            .seatingCapacity(mapping.seatingCapacity)
                            .fuelType(mapping.fuelType)
                            .weekdayDayRate(outstationRate)
                            .weekdayNightRate(outstationRate)
                            .weekendDayRate(outstationRate)
                            .weekendNightRate(outstationRate)
                            .vendorWeekdayDayRate(outstationVendorRate)
                            .vendorWeekdayNightRate(outstationVendorRate)
                            .vendorWeekendDayRate(outstationVendorRate)
                            .vendorWeekendNightRate(outstationVendorRate)
                            .baseIncludedKm(baseKm)
                            .baseFare(outstationBaseFare)
                            .vendorBaseFare(outstationVendorBaseFare)
                            .driverBattaDay(mapping.driverBattaDay)
                            .driverBattaNight(mapping.driverBattaNight)
                            .vendorDriverBattaDay(vendorBattaDay)
                            .vendorDriverBattaNight(vendorBattaNight)
                            .build());
                }
            }

            String sql = "INSERT INTO vehicle_tariffs (" +
                    "id, category, model_name, seating_capacity, fuel_type, is_seasonal, " +
                    "service_type, state, city, weekday_day_rate, weekday_night_rate, " +
                    "weekend_day_rate, weekend_night_rate, base_fare, base_included_km, " +
                    "driver_batta_day, driver_batta_night, toll_included, discount_percentage, " +
                    "vendor_weekday_day_rate, vendor_weekday_night_rate, vendor_weekend_day_rate, vendor_weekend_night_rate, " +
                    "vendor_base_fare, vendor_driver_batta_day, vendor_driver_batta_night, " +
                    "created_at, updated_at" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            long startMs = System.currentTimeMillis();
            Timestamp now = Timestamp.from(Instant.now());

            jdbcTemplate.batchUpdate(sql, tariffsToSave, 500, (ps, t) -> {
                ps.setObject(1, t.getId());
                ps.setString(2, t.getCategory());
                ps.setString(3, t.getModelName());
                ps.setString(4, t.getSeatingCapacity());
                ps.setString(5, t.getFuelType());
                ps.setBoolean(6, false);
                ps.setString(7, t.getServiceType());
                ps.setString(8, t.getState());
                ps.setString(9, t.getCity());
                ps.setBigDecimal(10, t.getWeekdayDayRate());
                ps.setBigDecimal(11, t.getWeekdayNightRate());
                ps.setBigDecimal(12, t.getWeekendDayRate());
                ps.setBigDecimal(13, t.getWeekendNightRate());
                ps.setBigDecimal(14, t.getBaseFare());
                ps.setInt(15, t.getBaseIncludedKm() != null ? t.getBaseIncludedKm() : 250);
                ps.setBigDecimal(16, t.getDriverBattaDay());
                ps.setBigDecimal(17, t.getDriverBattaNight());
                ps.setBoolean(18, false);
                ps.setBigDecimal(19, BigDecimal.ZERO);
                ps.setBigDecimal(20, t.getVendorWeekdayDayRate());
                ps.setBigDecimal(21, t.getVendorWeekdayNightRate());
                ps.setBigDecimal(22, t.getVendorWeekendDayRate());
                ps.setBigDecimal(23, t.getVendorWeekendNightRate());
                ps.setBigDecimal(24, t.getVendorBaseFare());
                ps.setBigDecimal(25, t.getVendorDriverBattaDay());
                ps.setBigDecimal(26, t.getVendorDriverBattaNight());
                ps.setTimestamp(27, now);
                ps.setTimestamp(28, now);
            });

            long elapsed = System.currentTimeMillis() - startMs;
            log.info("ChargesTariffSeeder: Successfully batch inserted {} tariffs across {} cities in {} ms!",
                    tariffsToSave.size(), records.size() / 8, elapsed);

        } catch (Exception e) {
            log.error("ChargesTariffSeeder: Error seeding charges tariffs: {}", e.getMessage(), e);
        }
    }
}

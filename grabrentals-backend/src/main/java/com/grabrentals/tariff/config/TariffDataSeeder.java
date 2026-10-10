package com.grabrentals.tariff.config;

import com.grabrentals.tariff.dto.VehicleModelConfigRequest;
import com.grabrentals.tariff.dto.VehicleTariffRequest;
import com.grabrentals.tariff.repository.VehicleModelConfigRepository;
import com.grabrentals.tariff.repository.VehicleTariffRepository;
import com.grabrentals.tariff.service.VehicleTariffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class TariffDataSeeder implements CommandLineRunner {

    private final VehicleModelConfigRepository modelConfigRepository;
    private final VehicleTariffRepository tariffRepository;
    private final VehicleTariffService tariffService;

    @Override
    public void run(String... args) {
        // Disabled auto-seeder to let user manually configure vehicle models, common photos, and tariffs.
        log.info("TariffDataSeeder ready: manual configuration active.");
    }

    private void seedVehicleModels() {
        if (modelConfigRepository.count() > 0) {
            return;
        }

        log.info("Seeding default vehicle model configurations and common catalog photos...");

        List<VehicleModelConfigRequest> defaults = List.of(
                // Sedans
                VehicleModelConfigRequest.builder()
                        .category("Sedan")
                        .modelName("Dzire")
                        .seatingCapacity("4")
                        .fuelType("Petrol + CNG")
                        .commonPhotoUrl("/images/cars/dzire.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("Sedan")
                        .modelName("Etios")
                        .seatingCapacity("4")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/etios.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("Sedan")
                        .modelName("Aura")
                        .seatingCapacity("4")
                        .fuelType("CNG")
                        .commonPhotoUrl("/images/cars/dzire.jpg")
                        .active(true)
                        .build(),

                // Hatchbacks
                VehicleModelConfigRequest.builder()
                        .category("Hatchback")
                        .modelName("WagonR")
                        .seatingCapacity("4")
                        .fuelType("Petrol + CNG")
                        .commonPhotoUrl("/images/cars/wagon_r.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("Hatchback")
                        .modelName("Swift")
                        .seatingCapacity("4")
                        .fuelType("Petrol")
                        .commonPhotoUrl("/images/cars/wagon_r.jpg")
                        .active(true)
                        .build(),

                // SUVs
                VehicleModelConfigRequest.builder()
                        .category("SUV")
                        .modelName("Ertiga")
                        .seatingCapacity("6")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/ertiga.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("SUV")
                        .modelName("Carens")
                        .seatingCapacity("6")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/ertiga.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("SUV")
                        .modelName("Xylo")
                        .seatingCapacity("6")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/ertiga.jpg")
                        .active(true)
                        .build(),

                // Innova Series
                VehicleModelConfigRequest.builder()
                        .category("Innova")
                        .modelName("Innova (Standard)")
                        .seatingCapacity("7")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/innova.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("Innovacrysta")
                        .modelName("Innova Crysta")
                        .seatingCapacity("7")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/innova.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("innovahycross")
                        .modelName("Innova Hycross")
                        .seatingCapacity("7")
                        .fuelType("Hybrid")
                        .commonPhotoUrl("/images/cars/innova.jpg")
                        .active(true)
                        .build(),

                // Large Fleet
                VehicleModelConfigRequest.builder()
                        .category("Tempo")
                        .modelName("Tempo Traveller")
                        .seatingCapacity("12")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/tempo.jpg")
                        .active(true)
                        .build(),
                VehicleModelConfigRequest.builder()
                        .category("urbania")
                        .modelName("Force Urbania")
                        .seatingCapacity("12")
                        .fuelType("Diesel")
                        .commonPhotoUrl("/images/cars/urbania.jpg")
                        .active(true)
                        .build()
        );

        defaults.forEach(tariffService::saveOrUpdateModelConfig);
        log.info("Default vehicle models seeded successfully.");
    }

    private void seedTariffs() {
        if (tariffRepository.count() > 0) {
            return;
        }

        log.info("Seeding default standard and seasonal tariffs...");

        List<VehicleTariffRequest> defaultTariffs = List.of(
                // Sedan Dzire 4 Seater Standard
                VehicleTariffRequest.builder()
                        .category("Sedan")
                        .modelName("Dzire")
                        .seatingCapacity("4")
                        .seasonal(false)
                        .weekdayDayRate(new BigDecimal("12.00"))
                        .weekdayNightRate(new BigDecimal("13.50"))
                        .weekendDayRate(new BigDecimal("13.50"))
                        .weekendNightRate(new BigDecimal("15.00"))
                        .baseFare(new BigDecimal("3000.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("400.00"))
                        .driverBattaNight(new BigDecimal("300.00"))
                        .build(),

                // Sedan Etios 4 Seater Standard
                VehicleTariffRequest.builder()
                        .category("Sedan")
                        .modelName("Etios")
                        .seatingCapacity("4")
                        .seasonal(false)
                        .weekdayDayRate(new BigDecimal("12.50"))
                        .weekdayNightRate(new BigDecimal("14.00"))
                        .weekendDayRate(new BigDecimal("14.00"))
                        .weekendNightRate(new BigDecimal("15.50"))
                        .baseFare(new BigDecimal("3125.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("400.00"))
                        .driverBattaNight(new BigDecimal("300.00"))
                        .build(),

                // Hatchback WagonR 4 Seater Standard
                VehicleTariffRequest.builder()
                        .category("Hatchback")
                        .modelName("WagonR")
                        .seatingCapacity("4")
                        .seasonal(false)
                        .weekdayDayRate(new BigDecimal("11.50"))
                        .weekdayNightRate(new BigDecimal("12.50"))
                        .weekendDayRate(new BigDecimal("12.50"))
                        .weekendNightRate(new BigDecimal("13.50"))
                        .baseFare(new BigDecimal("2875.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("350.00"))
                        .driverBattaNight(new BigDecimal("250.00"))
                        .build(),

                // SUV Ertiga 6 Seater Standard
                VehicleTariffRequest.builder()
                        .category("SUV")
                        .modelName("Ertiga")
                        .seatingCapacity("6")
                        .seasonal(false)
                        .weekdayDayRate(new BigDecimal("15.50"))
                        .weekdayNightRate(new BigDecimal("17.00"))
                        .weekendDayRate(new BigDecimal("17.00"))
                        .weekendNightRate(new BigDecimal("18.50"))
                        .baseFare(new BigDecimal("3875.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("450.00"))
                        .driverBattaNight(new BigDecimal("350.00"))
                        .build(),

                // Innova Crysta 7 Seater Standard
                VehicleTariffRequest.builder()
                        .category("Innovacrysta")
                        .modelName("Innova Crysta")
                        .seatingCapacity("7")
                        .seasonal(false)
                        .weekdayDayRate(new BigDecimal("19.50"))
                        .weekdayNightRate(new BigDecimal("21.50"))
                        .weekendDayRate(new BigDecimal("21.50"))
                        .weekendNightRate(new BigDecimal("23.50"))
                        .baseFare(new BigDecimal("4875.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("500.00"))
                        .driverBattaNight(new BigDecimal("400.00"))
                        .build(),

                // Seasonal Tariff Example: Diwali / Festival Peak
                VehicleTariffRequest.builder()
                        .category("Sedan")
                        .modelName("Dzire")
                        .seatingCapacity("4")
                        .seasonal(true)
                        .seasonName("Diwali & Holiday Peak Season")
                        .startDate(LocalDate.now().plusDays(2))
                        .endDate(LocalDate.now().plusDays(15))
                        .weekdayDayRate(new BigDecimal("14.00"))
                        .weekdayNightRate(new BigDecimal("15.50"))
                        .weekendDayRate(new BigDecimal("16.00"))
                        .weekendNightRate(new BigDecimal("17.50"))
                        .baseFare(new BigDecimal("3500.00"))
                        .baseIncludedKm(250)
                        .driverBattaDay(new BigDecimal("450.00"))
                        .driverBattaNight(new BigDecimal("350.00"))
                        .build()
        );

        defaultTariffs.forEach(tariffService::saveOrUpdateTariff);
        log.info("Default tariffs seeded successfully.");
    }
}

package com.grabrentals.tariff.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.tariff.dto.*;
import com.grabrentals.tariff.entity.VehicleModelConfig;
import com.grabrentals.tariff.entity.VehicleTariff;
import com.grabrentals.tariff.repository.VehicleModelConfigRepository;
import com.grabrentals.tariff.repository.VehicleTariffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleTariffService {

    private final VehicleModelConfigRepository modelConfigRepository;
    private final VehicleTariffRepository tariffRepository;

    // ==========================================
    // VEHICLE MODEL CONFIG CRUD
    // ==========================================

    @Transactional(readOnly = true)
    public List<VehicleModelConfigResponse> getAllModelConfigs() {
        return modelConfigRepository.findAll().stream()
                .map(VehicleModelConfigResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VehicleModelConfigResponse> getActiveModelConfigs() {
        return modelConfigRepository.findByActiveTrue().stream()
                .map(VehicleModelConfigResponse::fromEntity)
                .toList();
    }

    @Transactional
    public VehicleModelConfigResponse saveOrUpdateModelConfig(VehicleModelConfigRequest req) {
        VehicleModelConfig entity;
        if (req.getId() != null) {
            entity = modelConfigRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle model config not found: " + req.getId()));
        } else {
            // Check if existing by category, modelName, and seatingCapacity
            Optional<VehicleModelConfig> existing = modelConfigRepository
                    .findByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacity(
                            req.getCategory().trim(),
                            req.getModelName().trim(),
                            req.getSeatingCapacity().trim()
                    );
            entity = existing.orElseGet(VehicleModelConfig::new);
        }

        entity.setCategory(req.getCategory().trim());
        entity.setModelName(req.getModelName().trim());
        entity.setSeatingCapacity(req.getSeatingCapacity().trim());
        entity.setFuelType(req.getFuelType() != null ? req.getFuelType().trim() : "Diesel");
        if (req.getCommonPhotoUrl() != null && !req.getCommonPhotoUrl().isBlank()) {
            entity.setCommonPhotoUrl(req.getCommonPhotoUrl().trim());
        }
        if (req.getActive() != null) {
            entity.setActive(req.getActive());
        }

        VehicleModelConfig saved = modelConfigRepository.save(entity);
        return VehicleModelConfigResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteModelConfig(UUID id) {
        if (!modelConfigRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle model config not found: " + id);
        }
        modelConfigRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllModelConfigs() {
        modelConfigRepository.deleteAll();
    }

    @Transactional(readOnly = true)
    public String resolveCommonPhoto(String category, String modelName, String seatingCapacity) {
        if (category == null || category.isBlank()) return "/images/cars/dzire.jpg";

        // Try exact match
        if (modelName != null && !modelName.isBlank() && seatingCapacity != null && !seatingCapacity.isBlank()) {
            Optional<VehicleModelConfig> match = modelConfigRepository
                    .findByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacity(
                            category.trim(), modelName.trim(), seatingCapacity.trim()
                    );
            if (match.isPresent() && match.get().getCommonPhotoUrl() != null && !match.get().getCommonPhotoUrl().isBlank()) {
                return match.get().getCommonPhotoUrl();
            }
        }

        // Try category + model match
        if (modelName != null && !modelName.isBlank()) {
            Optional<VehicleModelConfig> match = modelConfigRepository
                    .findFirstByCategoryIgnoreCaseAndModelNameIgnoreCase(category.trim(), modelName.trim());
            if (match.isPresent() && match.get().getCommonPhotoUrl() != null && !match.get().getCommonPhotoUrl().isBlank()) {
                return match.get().getCommonPhotoUrl();
            }
        }

        // Try category match
        Optional<VehicleModelConfig> match = modelConfigRepository.findFirstByCategoryIgnoreCase(category.trim());
        if (match.isPresent() && match.get().getCommonPhotoUrl() != null && !match.get().getCommonPhotoUrl().isBlank()) {
            return match.get().getCommonPhotoUrl();
        }

        // Fallbacks
        String c = category.toLowerCase();
        if (c.contains("sedan") || c.contains("dzire") || c.contains("etios")) return "/images/cars/dzire.jpg";
        if (c.contains("hatch") || c.contains("wagon") || c.contains("swift")) return "/images/cars/wagon_r.jpg";
        if (c.contains("innova")) return "/images/cars/innova.jpg";
        if (c.contains("suv") || c.contains("ertiga")) return "/images/cars/ertiga.jpg";
        if (c.contains("tempo")) return "/images/cars/tempo.jpg";
        if (c.contains("urbania")) return "/images/cars/urbania.jpg";
        return "/images/cars/dzire.jpg";
    }

    // ==========================================
    // VEHICLE TARIFF CRUD
    // ==========================================

    @Transactional(readOnly = true)
    public List<VehicleTariffResponse> getAllTariffs() {
        return tariffRepository.findAll().stream()
                .map(VehicleTariffResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VehicleTariffResponse> getStandardTariffs() {
        return tariffRepository.findBySeasonalFalse().stream()
                .map(VehicleTariffResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VehicleTariffResponse> getSeasonalTariffs() {
        return tariffRepository.findBySeasonalTrue().stream()
                .map(VehicleTariffResponse::fromEntity)
                .toList();
    }

    @Transactional
    public VehicleTariffResponse saveOrUpdateTariff(VehicleTariffRequest req) {
        VehicleTariff entity;
        if (req.getId() != null) {
            entity = tariffRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tariff not found: " + req.getId()));
        } else {
            Optional<VehicleTariff> existing = Optional.empty();
            if (!Boolean.TRUE.equals(req.getSeasonal()) && req.getCategory() != null && req.getModelName() != null && req.getSeatingCapacity() != null) {
                existing = tariffRepository.findFirstByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
                        req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim()
                );
            }
            entity = existing.orElseGet(VehicleTariff::new);
        }

        entity.setCategory(req.getCategory().trim());
        entity.setModelName(req.getModelName().trim());
        entity.setSeatingCapacity(req.getSeatingCapacity().trim());
        entity.setSeasonal(Boolean.TRUE.equals(req.getSeasonal()));
        entity.setSeasonName(req.getSeasonName() != null ? req.getSeasonName().trim() : null);
        entity.setStartDate(req.getStartDate());
        entity.setEndDate(req.getEndDate());

        entity.setWeekdayDayRate(req.getWeekdayDayRate());
        entity.setWeekdayNightRate(req.getWeekdayNightRate());
        entity.setWeekendDayRate(req.getWeekendDayRate());
        entity.setWeekendNightRate(req.getWeekendNightRate());

        entity.setBaseFare(req.getBaseFare() != null ? req.getBaseFare() : BigDecimal.ZERO);
        entity.setBaseIncludedKm(req.getBaseIncludedKm() != null ? req.getBaseIncludedKm() : 250);
        entity.setDriverBattaDay(req.getDriverBattaDay() != null ? req.getDriverBattaDay() : new BigDecimal("400.00"));
        entity.setDriverBattaNight(req.getDriverBattaNight() != null ? req.getDriverBattaNight() : new BigDecimal("300.00"));

        VehicleTariff saved = tariffRepository.save(entity);
        return VehicleTariffResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTariff(UUID id) {
        if (!tariffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tariff not found: " + id);
        }
        tariffRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllTariffs() {
        tariffRepository.deleteAll();
    }

    // ==========================================
    // DYNAMIC RATE CALCULATION ENGINE
    // ==========================================

    /**
     * Resolves the exact per-km rate and pricing context for a given model, date, and pickup time.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String pickupDateStr,
            String pickupTimeStr
    ) {
        LocalDate date = parseDateSafe(pickupDateStr);
        LocalTime time = parseTimeSafe(pickupTimeStr);

        boolean isWeekend = (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY);
        String dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

        // Day slot: 06:00 to 22:00. Night slot: 22:00 to 06:00.
        boolean isNight = (time.isAfter(LocalTime.of(21, 59)) || time.isBefore(LocalTime.of(6, 0)));
        String timeSlot = isNight ? "NIGHT" : "DAY";

        // 1. Check for active Seasonal Tariff first
        Optional<VehicleTariff> seasonalOpt = Optional.empty();
        if (category != null && modelName != null && seatingCapacity != null) {
            seasonalOpt = tariffRepository.findSeasonalTariff(category.trim(), modelName.trim(), seatingCapacity.trim(), date);
        }

        boolean isSeasonalApplied = seasonalOpt.isPresent();
        VehicleTariff activeTariff = seasonalOpt.orElse(null);

        // 2. If no seasonal tariff, lookup standard tariff
        if (activeTariff == null && category != null && modelName != null && seatingCapacity != null) {
            activeTariff = tariffRepository
                    .findFirstByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
                            category.trim(), modelName.trim(), seatingCapacity.trim()
                    ).orElse(null);
        }

        // 3. Fallback: Lookup by category if model-specific rule not yet defined
        if (activeTariff == null && category != null) {
            activeTariff = tariffRepository.findFirstByCategoryIgnoreCaseAndSeasonalFalse(category.trim()).orElse(null);
        }

        BigDecimal chosenRate;
        BigDecimal baseFare = BigDecimal.ZERO;
        int baseKm = 250;
        BigDecimal driverBatta = isNight ? new BigDecimal("300.00") : new BigDecimal("400.00");

        if (activeTariff != null) {
            if (isWeekend) {
                chosenRate = isNight ? activeTariff.getWeekendNightRate() : activeTariff.getWeekendDayRate();
            } else {
                chosenRate = isNight ? activeTariff.getWeekdayNightRate() : activeTariff.getWeekdayDayRate();
            }
            if (activeTariff.getBaseFare() != null) baseFare = activeTariff.getBaseFare();
            if (activeTariff.getBaseIncludedKm() != null) baseKm = activeTariff.getBaseIncludedKm();
            if (isNight && activeTariff.getDriverBattaNight() != null) {
                driverBatta = activeTariff.getDriverBattaNight();
            } else if (!isNight && activeTariff.getDriverBattaDay() != null) {
                driverBatta = activeTariff.getDriverBattaDay();
            }
        } else {
            // Default system baseline rates
            chosenRate = getBaselineRate(category, isWeekend, isNight);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("ratePerKm", chosenRate);
        result.put("dayType", dayType);
        result.put("timeSlot", timeSlot);
        result.put("isSeasonal", isSeasonalApplied);
        result.put("seasonName", isSeasonalApplied ? activeTariff.getSeasonName() : null);
        result.put("baseFare", baseFare);
        result.put("baseIncludedKm", baseKm);
        result.put("driverBatta", driverBatta);
        result.put("category", category);
        result.put("modelName", modelName);
        result.put("seatingCapacity", seatingCapacity);
        result.put("date", date.toString());
        result.put("time", time.toString());

        return result;
    }

    private LocalDate parseDateSafe(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDate.now();
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ofPattern("d MMM yyyy"));
            } catch (Exception ex) {
                return LocalDate.now();
            }
        }
    }

    private LocalTime parseTimeSafe(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return LocalTime.of(9, 0);
        try {
            String clean = timeStr.trim().toUpperCase();
            if (clean.contains("AM") || clean.contains("PM")) {
                return LocalTime.parse(clean, DateTimeFormatter.ofPattern("h:mm a"));
            }
            return LocalTime.parse(clean);
        } catch (Exception e) {
            return LocalTime.of(9, 0);
        }
    }

    private BigDecimal getBaselineRate(String category, boolean isWeekend, boolean isNight) {
        BigDecimal base = new BigDecimal("12.00");
        String c = (category != null) ? category.toLowerCase() : "";

        if (c.contains("hatchback") || c.contains("wagon")) base = new BigDecimal("11.50");
        else if (c.contains("sedan") || c.contains("dzire") || c.contains("etios")) base = new BigDecimal("12.50");
        else if (c.contains("suv") || c.contains("ertiga")) base = new BigDecimal("15.50");
        else if (c.contains("innova crysta")) base = new BigDecimal("19.50");
        else if (c.contains("innova")) base = new BigDecimal("18.00");
        else if (c.contains("tempo")) base = new BigDecimal("24.00");
        else if (c.contains("urbania")) base = new BigDecimal("28.00");
        else if (c.contains("bus")) base = new BigDecimal("38.00");
        else if (c.contains("benz")) base = new BigDecimal("45.00");

        if (isWeekend) base = base.add(new BigDecimal("1.50"));
        if (isNight) base = base.add(new BigDecimal("1.00"));

        return base;
    }
}

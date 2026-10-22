package com.grabrentals.tariff.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.tariff.dto.*;
import com.grabrentals.tariff.entity.VehicleCategoryPreset;
import com.grabrentals.tariff.entity.VehicleModelConfig;
import com.grabrentals.tariff.entity.VehicleTariff;
import com.grabrentals.tariff.repository.VehicleCategoryPresetRepository;
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
    private final VehicleCategoryPresetRepository presetRepository;

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
        if (req.getDescription() != null) {
            entity.setDescription(req.getDescription().trim());
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

    @Transactional
    public void deleteByCategory(String category) {
        if (category == null || category.isBlank()) return;
        List<VehicleModelConfig> list = modelConfigRepository.findByCategoryIgnoreCase(category.trim());
        modelConfigRepository.deleteAll(list);
    }

    // ==========================================
    // VEHICLE CATEGORY & MODEL PRESETS (FOR DROPDOWNS)
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, List<String>> getCategoryModelPresets() {
        seedDefaultCategoryPresets();
        List<VehicleCategoryPreset> all = presetRepository.findAllByOrderByCategoryAscModelNameAsc();
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (VehicleCategoryPreset p : all) {
            result.computeIfAbsent(p.getCategory(), k -> new ArrayList<>()).add(p.getModelName());
        }
        return result;
    }

    @Transactional
    public void seedDefaultCategoryPresets() {
        if (presetRepository.count() > 0) {
            return;
        }
        Map<String, List<String>> defaultPresets = new LinkedHashMap<>();
        defaultPresets.put("Sedan", List.of("Dzire", "Etios", "Aura", "Amaze", "Verna", "Ciaz"));
        defaultPresets.put("Hatchback", List.of("WagonR", "Swift", "Tiago", "i20", "Baleno"));
        defaultPresets.put("SUV", List.of("Ertiga", "Carens", "Xylo", "Marazzo", "Scorpio", "Bolero"));
        defaultPresets.put("Innova", List.of("Innova (Standard 6+1)", "Innova (Standard 7+1)"));
        defaultPresets.put("Innovacrysta", List.of("Innova Crysta (6+1)", "Innova Crysta (7+1)"));
        defaultPresets.put("innovahycross", List.of("Innova Hycross (7+1)", "Innova Hycross (8+1)"));
        defaultPresets.put("Tempo", List.of("Tempo Traveller 12+1", "Tempo Traveller 13+1", "Tempo Traveller 17+1"));
        defaultPresets.put("urbania", List.of("Force Urbania 10+1", "Force Urbania 12+1", "Force Urbania 16+1"));
        defaultPresets.put("Bus", List.of("26 Seater Mini Bus", "35 Seater Luxury Coach", "45 Seater AC Bus"));
        defaultPresets.put("Benz", List.of("E-Class Executive", "C-Class Luxury", "S-Class First Class"));

        for (Map.Entry<String, List<String>> entry : defaultPresets.entrySet()) {
            String cat = entry.getKey();
            for (String mod : entry.getValue()) {
                presetRepository.save(VehicleCategoryPreset.builder()
                        .category(cat)
                        .modelName(mod)
                        .build());
            }
        }
    }

    @Transactional
    public void addCategoryPreset(String category, String modelName, String seatingCapacity, String fuelType) {
        if (category == null || category.isBlank()) return;
        String cat = category.trim();
        String mod = (modelName == null || modelName.isBlank()) ? (cat + " Model") : modelName.trim();
        if (!presetRepository.existsByCategoryIgnoreCaseAndModelNameIgnoreCase(cat, mod)) {
            presetRepository.save(VehicleCategoryPreset.builder()
                    .category(cat)
                    .modelName(mod)
                    .seatingCapacity(seatingCapacity)
                    .fuelType(fuelType)
                    .build());
        }
    }

    @Transactional
    public void deleteCategoryPreset(String category) {
        if (category == null || category.isBlank()) return;
        presetRepository.deleteByCategoryIgnoreCase(category.trim());
    }

    @Transactional
    public void deleteModelPreset(String category, String modelName) {
        if (category == null || category.isBlank() || modelName == null || modelName.isBlank()) return;
        presetRepository.deleteByCategoryIgnoreCaseAndModelNameIgnoreCase(category.trim(), modelName.trim());
    }

    @Transactional
    public void seedDefaultModelConfigs() {
        // Seeds only presets for dropdowns, does NOT populate catalog cars table
        seedDefaultCategoryPresets();
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
        String sType = (req.getServiceType() != null && !req.getServiceType().isBlank())
                ? req.getServiceType().trim().toUpperCase()
                : "OUTSTATION";

        String reqCity = req.getCity() != null && !req.getCity().isBlank() ? req.getCity().trim() : null;
        String reqState = req.getState() != null && !req.getState().isBlank() ? req.getState().trim() : null;

        if (req.getId() != null) {
            entity = tariffRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tariff not found: " + req.getId()));
        } else {
            Optional<VehicleTariff> existing = Optional.empty();
            String reqFuel = (req.getFuelType() != null && !req.getFuelType().isBlank()) ? req.getFuelType().trim() : "Diesel";
            if (!Boolean.TRUE.equals(req.getSeasonal()) && req.getCategory() != null && req.getModelName() != null && req.getSeatingCapacity() != null) {
                if (reqCity != null && !"all".equalsIgnoreCase(reqCity)) {
                    existing = tariffRepository.findStandardByModelAndCityAndFuel(
                            sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim(), reqFuel, reqCity
                    );
                    if (existing.isEmpty()) {
                        existing = tariffRepository.findStandardByModelAndCity(
                                sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim(), reqCity
                        );
                    }
                } else if (reqState != null && !"all".equalsIgnoreCase(reqState)) {
                    existing = tariffRepository.findStandardByModelAndStateAndFuel(
                            sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim(), reqFuel, reqState
                    );
                    if (existing.isEmpty()) {
                        existing = tariffRepository.findStandardByModelAndState(
                                sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim(), reqState
                        );
                    }
                } else {
                    existing = tariffRepository.findFirstByServiceTypeIgnoreCaseAndCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndFuelTypeIgnoreCaseAndSeasonalFalse(
                            sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim(), reqFuel
                    );
                    if (existing.isEmpty()) {
                        existing = tariffRepository.findFirstByServiceTypeIgnoreCaseAndCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
                                sType, req.getCategory().trim(), req.getModelName().trim(), req.getSeatingCapacity().trim()
                        );
                    }
                }
            }
            entity = existing.orElseGet(VehicleTariff::new);
        }

        entity.setServiceType(sType);
        entity.setState(reqState);
        entity.setCity(reqCity);
        entity.setCategory(req.getCategory().trim());
        entity.setModelName(req.getModelName().trim());
        entity.setSeatingCapacity(req.getSeatingCapacity().trim());
        entity.setFuelType((req.getFuelType() != null && !req.getFuelType().isBlank()) ? req.getFuelType().trim() : "Diesel");
        entity.setSeasonal(Boolean.TRUE.equals(req.getSeasonal()));
        entity.setSeasonName(req.getSeasonName() != null ? req.getSeasonName().trim() : null);
        entity.setStartDate(req.getStartDate());
        entity.setEndDate(req.getEndDate());

        // Outstation Customer Rates
        entity.setWeekdayDayRate(req.getWeekdayDayRate());
        entity.setWeekdayNightRate(req.getWeekdayNightRate());
        entity.setWeekendDayRate(req.getWeekendDayRate());
        entity.setWeekendNightRate(req.getWeekendNightRate());
        entity.setBaseFare(req.getBaseFare() != null ? req.getBaseFare() : BigDecimal.ZERO);
        entity.setBaseIncludedKm(req.getBaseIncludedKm() != null ? req.getBaseIncludedKm() : 250);
        entity.setDriverBattaDay(req.getDriverBattaDay() != null ? req.getDriverBattaDay() : new BigDecimal("400.00"));
        entity.setDriverBattaNight(req.getDriverBattaNight() != null ? req.getDriverBattaNight() : new BigDecimal("300.00"));

        // Outstation Vendor Rates
        entity.setVendorWeekdayDayRate(req.getVendorWeekdayDayRate());
        entity.setVendorWeekdayNightRate(req.getVendorWeekdayNightRate());
        entity.setVendorWeekendDayRate(req.getVendorWeekendDayRate());
        entity.setVendorWeekendNightRate(req.getVendorWeekendNightRate());
        entity.setVendorBaseFare(req.getVendorBaseFare());
        entity.setVendorDriverBattaDay(req.getVendorDriverBattaDay());
        entity.setVendorDriverBattaNight(req.getVendorDriverBattaNight());

        // Hourly / Local Package components
        entity.setPackageHours(req.getPackageHours());
        entity.setPackageKm(req.getPackageKm());
        entity.setHourlyWeekdayDayRate(req.getHourlyWeekdayDayRate());
        entity.setHourlyVendorWeekdayDayRate(req.getHourlyVendorWeekdayDayRate());
        entity.setHourlyWeekdayNightRate(req.getHourlyWeekdayNightRate());
        entity.setHourlyVendorWeekdayNightRate(req.getHourlyVendorWeekdayNightRate());
        entity.setHourlyWeekendDayRate(req.getHourlyWeekendDayRate());
        entity.setHourlyVendorWeekendDayRate(req.getHourlyVendorWeekendDayRate());
        entity.setHourlyWeekendNightRate(req.getHourlyWeekendNightRate());
        entity.setHourlyVendorWeekendNightRate(req.getHourlyVendorWeekendNightRate());
        entity.setHourlyCustomerFare(req.getHourlyCustomerFare() != null ? req.getHourlyCustomerFare() : req.getHourlyWeekdayDayRate());
        entity.setHourlyVendorFare(req.getHourlyVendorFare() != null ? req.getHourlyVendorFare() : req.getHourlyVendorWeekdayDayRate());
        entity.setHourlyCustomerWeekendFare(req.getHourlyCustomerWeekendFare() != null ? req.getHourlyCustomerWeekendFare() : req.getHourlyWeekendDayRate());
        entity.setHourlyVendorWeekendFare(req.getHourlyVendorWeekendFare() != null ? req.getHourlyVendorWeekendFare() : req.getHourlyVendorWeekendDayRate());
        entity.setExtraKmRate(req.getExtraKmRate());
        entity.setVendorExtraKmRate(req.getVendorExtraKmRate());
        entity.setExtraHourRate(req.getExtraHourRate());
        entity.setVendorExtraHourRate(req.getVendorExtraHourRate());

        // Airport Transfer components
        entity.setAirportCustomerFare(req.getAirportCustomerFare());
        entity.setAirportVendorFare(req.getAirportVendorFare());
        entity.setAirportCustomerWeekendFare(req.getAirportCustomerWeekendFare());
        entity.setAirportVendorWeekendFare(req.getAirportVendorWeekendFare());
        entity.setAirportIncludedKm(req.getAirportIncludedKm());
        entity.setAirportExtraKmRate(req.getAirportExtraKmRate());
        entity.setAirportVendorExtraKmRate(req.getAirportVendorExtraKmRate());
        entity.setTollIncluded(Boolean.TRUE.equals(req.getTollIncluded()));
        entity.setDiscountPercentage(req.getDiscountPercentage() != null ? req.getDiscountPercentage() : BigDecimal.ZERO);
        entity.setPetCharge(req.getPetCharge() != null ? req.getPetCharge() : BigDecimal.ZERO);
        entity.setVendorPetCharge(req.getVendorPetCharge() != null ? req.getVendorPetCharge() : BigDecimal.ZERO);

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
     * Resolves the exact customer rate and vendor payout context for a given model, date, and pickup time.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String pickupDateStr,
            String pickupTimeStr
    ) {
        return calculateRate(category, modelName, seatingCapacity, pickupDateStr, pickupTimeStr, "OUTSTATION");
    }

    @Transactional(readOnly = true)
    public List<VehicleTariff> getTariffsForService(String serviceType) {
        String sType = (serviceType != null && !serviceType.isBlank()) ? serviceType.trim().toUpperCase() : "OUTSTATION";
        if ("PACKAGE".equalsIgnoreCase(sType)) sType = "LOCAL";
        
        List<VehicleTariff> direct = tariffRepository.findByServiceTypeIgnoreCase(sType);
        List<VehicleTariff> fallbackTariffs = ("ONE_WAY".equalsIgnoreCase(sType) || "ROUND_TRIP".equalsIgnoreCase(sType))
                ? tariffRepository.findByServiceTypeIgnoreCase("OUTSTATION")
                : Collections.emptyList();

        Map<String, VehicleTariff> map = new LinkedHashMap<>();
        // 1. Fallback tariffs (OUTSTATION)
        if (fallbackTariffs != null) {
            for (VehicleTariff t : fallbackTariffs) {
                map.put(buildTariffVehicleKey(t), t);
            }
        }
        // 2. Direct tariffs for this specific serviceType (e.g. ONE_WAY or ROUND_TRIP or LOCAL or AIRPORT) overwrite fallbacks
        if (direct != null) {
            for (VehicleTariff t : direct) {
                map.put(buildTariffVehicleKey(t), t);
            }
        }
        
        return new ArrayList<>(map.values());
    }

    private String buildTariffVehicleKey(VehicleTariff t) {
        if (t == null) return "";
        String prefix = Boolean.TRUE.equals(t.getSeasonal()) ? ("seasonal_" + (t.getId() != null ? t.getId() : UUID.randomUUID())) : "standard";
        String city = (t.getCity() != null && !t.getCity().isBlank()) ? t.getCity().trim().toLowerCase() : "all";
        String state = (t.getState() != null && !t.getState().isBlank()) ? t.getState().trim().toLowerCase() : "all";
        String category = (t.getCategory() != null && !t.getCategory().isBlank()) ? t.getCategory().trim().toLowerCase() : "all";
        String model = (t.getModelName() != null && !t.getModelName().isBlank()) ? t.getModelName().trim().toLowerCase() : "all";
        String fuel = (t.getFuelType() != null && !t.getFuelType().isBlank()) ? t.getFuelType().trim().toLowerCase() : "all";
        String seats = (t.getSeatingCapacity() != null && !t.getSeatingCapacity().isBlank()) ? t.getSeatingCapacity().trim() : "all";
        return prefix + "_" + state + "_" + city + "_" + category + "_" + model + "_" + fuel + "_" + seats;
    }

    @Transactional(readOnly = true)
    public boolean isCityServiceable(String city, String state) {
        return isCityServiceable(city, state, "OUTSTATION");
    }

    @Transactional(readOnly = true)
    public boolean isCityServiceable(String city, String state, String serviceType) {
        String sType = (serviceType != null && !serviceType.isBlank()) ? serviceType.trim().toUpperCase() : "OUTSTATION";
        if ("PACKAGE".equalsIgnoreCase(sType)) sType = "LOCAL";
        List<VehicleTariff> tariffs = getTariffsForService(sType);
        return isCityServiceable(city, state, sType, tariffs);
    }

    public boolean isCityServiceable(String city, String state, String serviceType, List<VehicleTariff> tariffs) {
        if (city == null || city.isBlank()) return true;
        if (tariffs == null || tariffs.isEmpty()) {
            return false;
        }
        String cleanCity = city.trim();
        String cleanState = (state != null) ? state.trim() : "";

        return tariffs.stream().anyMatch(t -> {
            String tCity = t.getCity();
            String tState = t.getState();
            if (tCity != null && areCitiesEqual(cleanCity, tCity)) {
                return true;
            }
            boolean isAllCity = (tCity == null || tCity.isBlank() || "all".equalsIgnoreCase(tCity.trim()));
            return isAllCity && (cleanState.isEmpty() || (tState != null && cleanState.equalsIgnoreCase(tState.trim())));
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String pickupDateStr,
            String pickupTimeStr,
            String serviceType
    ) {
        return calculateRate(category, modelName, seatingCapacity, pickupDateStr, pickupTimeStr, serviceType, null, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String pickupDateStr,
            String pickupTimeStr,
            String serviceType,
            String city,
            String state
    ) {
        String sType = (serviceType != null && !serviceType.isBlank()) ? serviceType.trim().toUpperCase() : "OUTSTATION";
        List<VehicleTariff> tariffs = tariffRepository.findByServiceTypeIgnoreCase(sType);
        return calculateRate(category, modelName, seatingCapacity, pickupDateStr, pickupTimeStr, sType, city, state, tariffs);
    }

    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String pickupDateStr,
            String pickupTimeStr,
            String serviceType,
            String city,
            String state,
            List<VehicleTariff> tariffs
    ) {
        return calculateRate(category, modelName, seatingCapacity, null, pickupDateStr, pickupTimeStr, serviceType, city, state, tariffs);
    }

    public Map<String, Object> calculateRate(
            String category,
            String modelName,
            String seatingCapacity,
            String fuelType,
            String pickupDateStr,
            String pickupTimeStr,
            String serviceType,
            String city,
            String state,
            List<VehicleTariff> tariffs
    ) {
        final String sType = ("PACKAGE".equalsIgnoreCase(serviceType))
                ? "LOCAL"
                : ((serviceType != null && !serviceType.isBlank()) ? serviceType.trim().toUpperCase() : "OUTSTATION");
        LocalDate date = parseDateSafe(pickupDateStr);
        LocalTime time = parseTimeSafe(pickupTimeStr);

        boolean isWeekend = (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY);
        String dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

        // Day slot: 06:00 to 22:00. Night slot: 22:00 to 06:00.
        boolean isNight = (time.isAfter(LocalTime.of(21, 59)) || time.isBefore(LocalTime.of(6, 0)));
        String timeSlot = isNight ? "NIGHT" : "DAY";

        List<VehicleTariff> safeTariffs = (tariffs != null) ? tariffs : tariffRepository.findByServiceTypeIgnoreCase(sType);

        // 1. Check for active Seasonal Tariff first
        Optional<VehicleTariff> seasonalOpt = Optional.empty();
        if (category != null && modelName != null && seatingCapacity != null) {
            seasonalOpt = safeTariffs.stream().filter(t ->
                    Boolean.TRUE.equals(t.getSeasonal())
                    && sType.equalsIgnoreCase(t.getServiceType())
                    && t.getStartDate() != null && t.getEndDate() != null
                    && !date.isBefore(t.getStartDate()) && !date.isAfter(t.getEndDate())
                    && category.trim().equalsIgnoreCase(t.getCategory())
                    && modelName.trim().equalsIgnoreCase(t.getModelName())
                    && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                    && (fuelType == null || t.getFuelType() == null || fuelType.trim().equalsIgnoreCase(t.getFuelType()))
            ).findFirst();
        }

        boolean isSeasonalApplied = seasonalOpt.isPresent();
        VehicleTariff activeTariff = seasonalOpt.orElse(null);

        // 2a. Priority 1: City-specific standard tariff
        if (activeTariff == null && category != null && modelName != null && seatingCapacity != null && city != null && !city.isBlank()) {
            if (fuelType != null && !fuelType.isBlank()) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                        && t.getFuelType() != null && fuelType.trim().equalsIgnoreCase(t.getFuelType())
                        && t.getCity() != null && areCitiesEqual(city, t.getCity())
                ).findFirst().orElse(null);
            }
            if (activeTariff == null) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                        && t.getCity() != null && areCitiesEqual(city, t.getCity())
                ).findFirst().orElse(null);
            }
        }

        // 2b. Priority 2: State-level standard tariff (where city = 'ALL' or null)
        if (activeTariff == null && category != null && modelName != null && seatingCapacity != null && state != null && !state.isBlank()) {
            if (fuelType != null && !fuelType.isBlank()) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                        && t.getFuelType() != null && fuelType.trim().equalsIgnoreCase(t.getFuelType())
                        && (t.getCity() == null || t.getCity().isBlank() || "all".equalsIgnoreCase(t.getCity().trim()))
                        && t.getState() != null && state.trim().equalsIgnoreCase(t.getState().trim())
                ).findFirst().orElse(null);
            }
            if (activeTariff == null) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                        && (t.getCity() == null || t.getCity().isBlank() || "all".equalsIgnoreCase(t.getCity().trim()))
                        && t.getState() != null && state.trim().equalsIgnoreCase(t.getState().trim())
                ).findFirst().orElse(null);
            }
        }

        // 2c. Fallback: If no city/state filter specified, look up tariff for this EXACT serviceType
        if (activeTariff == null && category != null && modelName != null && seatingCapacity != null && (city == null || city.isBlank())) {
            if (fuelType != null && !fuelType.isBlank()) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                        && t.getFuelType() != null && fuelType.trim().equalsIgnoreCase(t.getFuelType())
                ).findFirst().orElse(null);
            }
            if (activeTariff == null) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && sType.equalsIgnoreCase(t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                        && modelName.trim().equalsIgnoreCase(t.getModelName())
                        && seatingCapacity.trim().equalsIgnoreCase(t.getSeatingCapacity())
                ).findFirst().orElse(null);
            }
        }

        // 3. Fallback: Lookup by category for this EXACT serviceType
        if (activeTariff == null && category != null) {
            activeTariff = safeTariffs.stream().filter(t ->
                    !Boolean.TRUE.equals(t.getSeasonal())
                    && sType.equalsIgnoreCase(t.getServiceType())
                    && category.trim().equalsIgnoreCase(t.getCategory())
            ).findFirst().orElse(null);
        }

        // 5. Fallback for ONE_WAY / ROUND_TRIP: If no explicit ONE_WAY/ROUND_TRIP tariff exists, fallback to compatible outstation tariffs
        if (activeTariff == null && ("ONE_WAY".equalsIgnoreCase(sType) || "ROUND_TRIP".equalsIgnoreCase(sType))) {
            if (city != null && !city.isBlank()) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && isCompatibleServiceType(sType, t.getServiceType())
                        && (category == null || category.trim().equalsIgnoreCase(t.getCategory()))
                        && (modelName == null || modelName.trim().equalsIgnoreCase(t.getModelName()))
                        && t.getCity() != null && areCitiesEqual(city, t.getCity())
                ).findFirst().orElse(null);
            }
            if (activeTariff == null) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && isCompatibleServiceType(sType, t.getServiceType())
                        && (category == null || category.trim().equalsIgnoreCase(t.getCategory()))
                        && (modelName == null || modelName.trim().equalsIgnoreCase(t.getModelName()))
                ).findFirst().orElse(null);
            }
            if (activeTariff == null && category != null) {
                activeTariff = safeTariffs.stream().filter(t ->
                        !Boolean.TRUE.equals(t.getSeasonal())
                        && isCompatibleServiceType(sType, t.getServiceType())
                        && category.trim().equalsIgnoreCase(t.getCategory())
                ).findFirst().orElse(null);
            }
        }

        BigDecimal chosenRate;
        BigDecimal vendorRate;
        BigDecimal baseFare = BigDecimal.ZERO;
        BigDecimal vendorBaseFare = BigDecimal.ZERO;
        int baseKm = 250;
        BigDecimal driverBatta = isNight ? new BigDecimal("300.00") : new BigDecimal("400.00");
        BigDecimal vendorDriverBatta = isNight ? new BigDecimal("250.00") : new BigDecimal("300.00");

        if (activeTariff != null) {
            if (isWeekend) {
                chosenRate = isNight ? activeTariff.getWeekendNightRate() : activeTariff.getWeekendDayRate();
                vendorRate = isNight ? activeTariff.getVendorWeekendNightRate() : activeTariff.getVendorWeekendDayRate();
            } else {
                chosenRate = isNight ? activeTariff.getWeekdayNightRate() : activeTariff.getWeekdayDayRate();
                vendorRate = isNight ? activeTariff.getVendorWeekdayNightRate() : activeTariff.getVendorWeekdayDayRate();
            }

            if (chosenRate == null) {
                chosenRate = getBaselineRate(category, isWeekend, isNight);
            }
            if (vendorRate == null) {
                vendorRate = chosenRate.multiply(new BigDecimal("0.75")).setScale(2, java.math.RoundingMode.HALF_UP);
            }

            if (activeTariff.getBaseFare() != null) baseFare = activeTariff.getBaseFare();
            if (activeTariff.getVendorBaseFare() != null) {
                vendorBaseFare = activeTariff.getVendorBaseFare();
            } else {
                vendorBaseFare = baseFare.multiply(new BigDecimal("0.75")).setScale(2, java.math.RoundingMode.HALF_UP);
            }

            if (activeTariff.getBaseIncludedKm() != null) baseKm = activeTariff.getBaseIncludedKm();
            if (isNight && activeTariff.getDriverBattaNight() != null) {
                driverBatta = activeTariff.getDriverBattaNight();
            } else if (!isNight && activeTariff.getDriverBattaDay() != null) {
                driverBatta = activeTariff.getDriverBattaDay();
            }

            if (isNight && activeTariff.getVendorDriverBattaNight() != null) {
                vendorDriverBatta = activeTariff.getVendorDriverBattaNight();
            } else if (!isNight && activeTariff.getVendorDriverBattaDay() != null) {
                vendorDriverBatta = activeTariff.getVendorDriverBattaDay();
            }
        } else {
            // Default system baseline rates
            chosenRate = getBaselineRate(category, isWeekend, isNight);
            vendorRate = chosenRate.multiply(new BigDecimal("0.75")).setScale(2, java.math.RoundingMode.HALF_UP);
            baseFare = chosenRate.multiply(BigDecimal.valueOf(250)).setScale(2, java.math.RoundingMode.HALF_UP);
            vendorBaseFare = vendorRate.multiply(BigDecimal.valueOf(250)).setScale(2, java.math.RoundingMode.HALF_UP);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("serviceType", sType);
        result.put("ratePerKm", chosenRate);
        result.put("vendorRatePerKm", vendorRate);
        result.put("dayType", dayType);
        result.put("timeSlot", timeSlot);
        result.put("isSeasonal", isSeasonalApplied);
        result.put("seasonName", isSeasonalApplied ? activeTariff.getSeasonName() : null);
        result.put("baseFare", baseFare);
        result.put("vendorBaseFare", vendorBaseFare);
        result.put("baseIncludedKm", baseKm);
        result.put("driverBatta", driverBatta);
        result.put("vendorDriverBatta", vendorDriverBatta);
        result.put("category", category);
        result.put("modelName", modelName);
        result.put("seatingCapacity", seatingCapacity);
        result.put("date", date.toString());
        result.put("time", time.toString());

        boolean hasModelTariff = false;
        if (seasonalOpt.isPresent()) {
            hasModelTariff = true;
        } else if (activeTariff != null) {
            if (activeTariff.getModelName() != null && !activeTariff.getModelName().isBlank()) {
                hasModelTariff = activeTariff.getModelName().trim().equalsIgnoreCase(modelName != null ? modelName.trim() : "");
            } else {
                hasModelTariff = true;
            }
        } else if ("LOCAL".equalsIgnoreCase(sType) || "AIRPORT".equalsIgnoreCase(sType)) {
            hasModelTariff = true;
        }
        result.put("hasTariff", hasModelTariff);
        result.put("discountPercentage", activeTariff != null && activeTariff.getDiscountPercentage() != null ? activeTariff.getDiscountPercentage() : BigDecimal.ZERO);
        
        BigDecimal petCharge = (activeTariff != null && activeTariff.getPetCharge() != null)
                ? activeTariff.getPetCharge()
                : BigDecimal.ZERO;
        BigDecimal vendorPetCharge = (activeTariff != null && activeTariff.getVendorPetCharge() != null)
                ? activeTariff.getVendorPetCharge()
                : BigDecimal.ZERO;
        result.put("petCharge", petCharge);
        result.put("vendorPetCharge", vendorPetCharge);

        // Hourly package attributes if present
        if ("HOURLY".equalsIgnoreCase(sType) || "LOCAL".equalsIgnoreCase(sType)) {
            BigDecimal hCust = null;
            BigDecimal hVend = null;
            Integer pkgH = 8;
            Integer pkgK = 80;
            BigDecimal exKm = (chosenRate != null) ? chosenRate : new BigDecimal("14.00");
            BigDecimal exHr = new BigDecimal("150.00");

            BigDecimal hourlyRatePerHour = null;
            BigDecimal vendorHourlyRatePerHour = null;

            if (activeTariff != null) {
                if (isWeekend) {
                    hourlyRatePerHour = isNight ? activeTariff.getHourlyWeekendNightRate() : activeTariff.getHourlyWeekendDayRate();
                    vendorHourlyRatePerHour = isNight ? activeTariff.getHourlyVendorWeekendNightRate() : activeTariff.getHourlyVendorWeekendDayRate();
                } else {
                    hourlyRatePerHour = isNight ? activeTariff.getHourlyWeekdayNightRate() : activeTariff.getHourlyWeekdayDayRate();
                    vendorHourlyRatePerHour = isNight ? activeTariff.getHourlyVendorWeekdayNightRate() : activeTariff.getHourlyVendorWeekdayDayRate();
                }

                BigDecimal candidateCust = isWeekend && activeTariff.getHourlyCustomerWeekendFare() != null
                        ? activeTariff.getHourlyCustomerWeekendFare() : activeTariff.getHourlyCustomerFare();
                if (candidateCust != null && candidateCust.compareTo(new BigDecimal("100.00")) < 0
                        && activeTariff.getHourlyCustomerFare() != null && activeTariff.getHourlyCustomerFare().compareTo(new BigDecimal("100.00")) >= 0) {
                    candidateCust = activeTariff.getHourlyCustomerFare();
                }
                hCust = candidateCust;

                BigDecimal candidateVend = isWeekend && activeTariff.getHourlyVendorWeekendFare() != null
                        ? activeTariff.getHourlyVendorWeekendFare() : activeTariff.getHourlyVendorFare();
                if (candidateVend != null && candidateVend.compareTo(new BigDecimal("100.00")) < 0
                        && activeTariff.getHourlyVendorFare() != null && activeTariff.getHourlyVendorFare().compareTo(new BigDecimal("100.00")) >= 0) {
                    candidateVend = activeTariff.getHourlyVendorFare();
                }
                hVend = candidateVend;

                // If package fare is not explicitly set, calculate based on hourlyRatePerHour * pkgHours
                if ((hCust == null || hCust.compareTo(BigDecimal.ZERO) <= 0) && hourlyRatePerHour != null && hourlyRatePerHour.compareTo(BigDecimal.ZERO) > 0) {
                    hCust = hourlyRatePerHour.multiply(BigDecimal.valueOf(pkgH));
                }
                if ((hVend == null || hVend.compareTo(BigDecimal.ZERO) <= 0) && vendorHourlyRatePerHour != null && vendorHourlyRatePerHour.compareTo(BigDecimal.ZERO) > 0) {
                    hVend = vendorHourlyRatePerHour.multiply(BigDecimal.valueOf(pkgH));
                }

                if (activeTariff.getPackageHours() != null) pkgH = activeTariff.getPackageHours();
                if (activeTariff.getPackageKm() != null) pkgK = activeTariff.getPackageKm();
                if (activeTariff.getExtraKmRate() != null) exKm = activeTariff.getExtraKmRate();
                if (activeTariff.getExtraHourRate() != null) {
                    exHr = activeTariff.getExtraHourRate();
                } else if (hourlyRatePerHour != null && hourlyRatePerHour.compareTo(BigDecimal.ZERO) > 0) {
                    exHr = hourlyRatePerHour;
                }
            }

            if (hCust == null || hCust.compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal comp = (chosenRate != null ? chosenRate : new BigDecimal("13.00"))
                        .multiply(BigDecimal.valueOf(pkgK != null ? pkgK : 80))
                        .add(driverBatta != null ? driverBatta : new BigDecimal("400.00"));
                hCust = comp.multiply(new BigDecimal("1.10")).setScale(0, java.math.RoundingMode.HALF_UP);
            }
            if (hVend == null || hVend.compareTo(BigDecimal.ZERO) <= 0) {
                hVend = hCust.multiply(new BigDecimal("0.75")).setScale(0, java.math.RoundingMode.HALF_UP);
            }

            result.put("hourlyCustomerFare", hCust);
            result.put("hourlyVendorFare", hVend);
            result.put("hourlyRatePerHour", hourlyRatePerHour);
            result.put("vendorHourlyRatePerHour", vendorHourlyRatePerHour);
            result.put("packageHours", pkgH);
            result.put("packageKm", pkgK);
            result.put("extraKmRate", exKm);
            result.put("vendorExtraKmRate", (activeTariff != null && activeTariff.getVendorExtraKmRate() != null)
                    ? activeTariff.getVendorExtraKmRate() : exKm.multiply(new BigDecimal("0.80")).setScale(2, java.math.RoundingMode.HALF_UP));
            result.put("extraHourRate", exHr);
            result.put("vendorExtraHourRate", (activeTariff != null && activeTariff.getVendorExtraHourRate() != null)
                    ? activeTariff.getVendorExtraHourRate() : (vendorHourlyRatePerHour != null ? vendorHourlyRatePerHour : new BigDecimal("100.00")));
        }

        // Airport transfer attributes if present
        if ("AIRPORT".equalsIgnoreCase(sType)) {
            BigDecimal aCust = null;
            BigDecimal aVend = null;
            Integer aIncKm = (activeTariff != null && activeTariff.getAirportIncludedKm() != null)
                    ? activeTariff.getAirportIncludedKm() : 35;
            BigDecimal aExKm = (activeTariff != null && activeTariff.getAirportExtraKmRate() != null)
                    ? activeTariff.getAirportExtraKmRate() : ((chosenRate != null) ? chosenRate : new BigDecimal("14.00"));

            if (activeTariff != null) {
                aCust = isWeekend && activeTariff.getAirportCustomerWeekendFare() != null
                        ? activeTariff.getAirportCustomerWeekendFare() : activeTariff.getAirportCustomerFare();
                aVend = isWeekend && activeTariff.getAirportVendorWeekendFare() != null
                        ? activeTariff.getAirportVendorWeekendFare() : activeTariff.getAirportVendorFare();
            }

            if (aCust == null || aCust.compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal comp = (chosenRate != null ? chosenRate : new BigDecimal("13.00"))
                        .multiply(BigDecimal.valueOf(aIncKm))
                        .add(driverBatta != null ? driverBatta : new BigDecimal("350.00"));
                aCust = comp.multiply(new BigDecimal("1.10")).setScale(0, java.math.RoundingMode.HALF_UP);
            }
            if (aVend == null || aVend.compareTo(BigDecimal.ZERO) <= 0) {
                aVend = aCust.multiply(new BigDecimal("0.75")).setScale(0, java.math.RoundingMode.HALF_UP);
            }

            result.put("airportCustomerFare", aCust);
            result.put("airportVendorFare", aVend);
            result.put("airportIncludedKm", aIncKm);
            result.put("airportExtraKmRate", aExKm);
            result.put("airportVendorExtraKmRate", (activeTariff != null && activeTariff.getAirportVendorExtraKmRate() != null)
                    ? activeTariff.getAirportVendorExtraKmRate() : aExKm.multiply(new BigDecimal("0.80")).setScale(2, java.math.RoundingMode.HALF_UP));
            result.put("tollIncluded", activeTariff != null ? activeTariff.getTollIncluded() : true);
        }

        result.put("fuelType", (activeTariff != null && activeTariff.getFuelType() != null)
                ? activeTariff.getFuelType()
                : (fuelType != null && !fuelType.isBlank() ? fuelType : "Diesel"));

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

    public static boolean areCitiesEqual(String c1, String c2) {
        if (c1 == null || c2 == null) return false;
        String a = c1.trim().toLowerCase();
        String b = c2.trim().toLowerCase();
        if (a.equals(b)) return true;

        String normA = normalizeCityAlias(a);
        String normB = normalizeCityAlias(b);
        if (normA.equals(normB)) return true;

        String cleanA = cleanCityLandmarks(normA);
        String cleanB = cleanCityLandmarks(normB);
        if (!cleanA.isBlank() && !cleanB.isBlank()) {
            if (cleanA.equals(cleanB)) return true;
            if (normalizeCityAlias(cleanA).equals(normalizeCityAlias(cleanB))) return true;
        }

        // Substring / word boundary matching (e.g. "madurai railway station" contains "madurai")
        if (containsCityWord(normA, normB) || containsCityWord(normB, normA)) return true;
        if (!cleanA.isBlank() && !cleanB.isBlank() && (containsCityWord(cleanA, cleanB) || containsCityWord(cleanB, cleanA))) return true;

        return false;
    }

    private static boolean containsCityWord(String full, String target) {
        if (full == null || target == null) return false;
        String f = full.trim().toLowerCase();
        String t = target.trim().toLowerCase();
        if (t.length() < 3) return false;
        return java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(t) + "\\b").matcher(f).find();
    }

    public static String cleanCityLandmarks(String name) {
        if (name == null) return "";
        String s = name.trim().toLowerCase();
        s = s.replaceAll("(?i)\\b(railway station|railway junction|railway stn|rly station|rly stn|train station|junction|central railway|central station|metro station|bus stand|bus stop|bus station|bus terminal|isbt|airport|intl airport|international airport|domestic airport|aerodrome|city center|city centre|cantt|cantonment|fort|district|dist|taluk|main|east|west|north|south|town|city)\\b", " ");
        s = s.replaceAll("\\s+", " ").trim();
        return s;
    }

    public static String normalizeCityAlias(String name) {
        if (name == null) return "";
        String s = name.trim().toLowerCase();
        if (s.equals("bangalore") || s.equals("bengaluru")) return "bangalore";
        if (s.equals("bombay") || s.equals("mumbai")) return "mumbai";
        if (s.equals("madras") || s.equals("chennai")) return "chennai";
        if (s.equals("calcutta") || s.equals("kolkata")) return "kolkata";
        if (s.equals("cochin") || s.equals("kochi")) return "kochi";
        if (s.equals("trivandrum") || s.equals("thiruvananthapuram")) return "trivandrum";
        if (s.equals("mysore") || s.equals("mysuru")) return "mysore";
        if (s.equals("mangalore") || s.equals("mangaluru")) return "mangalore";
        if (s.equals("pondicherry") || s.equals("puducherry")) return "pondicherry";
        if (s.equals("gurgaon") || s.equals("gurugram")) return "gurgaon";
        if (s.equals("baroda") || s.equals("vadodara")) return "vadodara";
        if (s.equals("poona") || s.equals("pune")) return "pune";
        return s;
    }

    public static boolean isCompatibleServiceType(String targetType, String tariffType) {
        if (targetType == null || tariffType == null) return false;
        if (targetType.equalsIgnoreCase(tariffType)) return true;
        boolean targetIsOutstation = "ROUND_TRIP".equalsIgnoreCase(targetType)
                || "ONE_WAY".equalsIgnoreCase(targetType)
                || "OUTSTATION".equalsIgnoreCase(targetType);
        boolean tariffIsOutstation = "ROUND_TRIP".equalsIgnoreCase(tariffType)
                || "ONE_WAY".equalsIgnoreCase(tariffType)
                || "OUTSTATION".equalsIgnoreCase(tariffType);
        return targetIsOutstation && tariffIsOutstation;
    }
}

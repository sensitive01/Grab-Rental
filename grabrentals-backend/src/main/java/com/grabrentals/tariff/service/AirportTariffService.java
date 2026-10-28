package com.grabrentals.tariff.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.tariff.dto.AirportTariffRequest;
import com.grabrentals.tariff.dto.AirportTariffResponse;
import com.grabrentals.tariff.entity.AirportTariff;
import com.grabrentals.tariff.repository.AirportTariffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AirportTariffService {

    private final AirportTariffRepository airportTariffRepository;

    @Transactional(readOnly = true)
    public List<AirportTariffResponse> getAllTariffs(
            String city,
            String tripDirection,
            String category,
            String pricingType,
            String status
    ) {
        List<AirportTariff> list = airportTariffRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .filter(t -> city == null || city.isBlank() || "ALL".equalsIgnoreCase(city) || (t.getCity() != null && t.getCity().equalsIgnoreCase(city.trim())))
                .filter(t -> tripDirection == null || tripDirection.isBlank() || "ALL".equalsIgnoreCase(tripDirection) || t.getTripDirection().equalsIgnoreCase(tripDirection.trim()) || "BOTH".equalsIgnoreCase(t.getTripDirection()))
                .filter(t -> category == null || category.isBlank() || "ALL".equalsIgnoreCase(category) || (t.getCategory() != null && t.getCategory().equalsIgnoreCase(category.trim())))
                .filter(t -> pricingType == null || pricingType.isBlank() || "ALL".equalsIgnoreCase(pricingType) || (t.getPricingType() != null && t.getPricingType().equalsIgnoreCase(pricingType.trim())))
                .filter(t -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) || (t.getStatus() != null && t.getStatus().equalsIgnoreCase(status.trim())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AirportTariffResponse getTariffById(UUID id) {
        AirportTariff entity = airportTariffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Airport tariff not found with id: " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public AirportTariffResponse saveOrUpdateTariff(AirportTariffRequest req) {
        AirportTariff entity;
        if (req.getId() != null) {
            entity = airportTariffRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Airport tariff not found with id: " + req.getId()));
        } else {
            entity = new AirportTariff();
        }

        entity.setTripDirection(req.getTripDirection() != null ? req.getTripDirection().trim().toUpperCase() : "BOTH");
        entity.setPricingType(req.getPricingType() != null ? req.getPricingType().trim().toUpperCase() : "REGULAR");
        entity.setTitle(req.getTitle() != null ? req.getTitle().trim() : null);
        entity.setState(req.getState() != null ? req.getState().trim() : "ALL");
        entity.setCity(req.getCity() != null ? req.getCity().trim() : "ALL");
        entity.setAirportName(req.getAirportName() != null ? req.getAirportName().trim() : "ALL");
        entity.setMinKm(req.getMinKm() != null ? req.getMinKm() : 0);
        entity.setMaxKm(req.getMaxKm() != null ? req.getMaxKm() : 35);
        entity.setCategory(req.getCategory() != null ? req.getCategory().trim() : "Sedan");
        entity.setModelName(req.getModelName() != null && !req.getModelName().isBlank() ? req.getModelName().trim() : "ALL");
        entity.setSeatingCapacity(req.getSeatingCapacity() != null && !req.getSeatingCapacity().isBlank() ? req.getSeatingCapacity().trim() : "4");
        entity.setFuelType(req.getFuelType() != null && !req.getFuelType().isBlank() ? req.getFuelType().trim() : "ALL");
        entity.setCustomerFare(req.getCustomerFare());
        entity.setVendorFare(req.getVendorFare() != null ? req.getVendorFare() : req.getCustomerFare().multiply(new BigDecimal("0.75")));
        entity.setExtraKmRate(req.getExtraKmRate() != null ? req.getExtraKmRate() : BigDecimal.ZERO);
        entity.setVendorExtraKmRate(req.getVendorExtraKmRate() != null ? req.getVendorExtraKmRate() : (req.getExtraKmRate() != null ? req.getExtraKmRate().multiply(new BigDecimal("0.80")) : BigDecimal.ZERO));
        entity.setDaysOfWeek(req.getDaysOfWeek() != null && !req.getDaysOfWeek().isBlank() ? req.getDaysOfWeek().trim().toUpperCase() : "ALL");
        entity.setTimeSlotType(req.getTimeSlotType() != null && !req.getTimeSlotType().isBlank() ? req.getTimeSlotType().trim().toUpperCase() : "ALL_DAY");
        entity.setTimeRangeStart(req.getTimeRangeStart());
        entity.setTimeRangeEnd(req.getTimeRangeEnd());
        entity.setExpiryType(req.getExpiryType() != null ? req.getExpiryType().trim().toUpperCase() : "NEVER");
        entity.setStartDate(req.getStartDate());
        entity.setEndDate(req.getEndDate());
        entity.setStatus(req.getStatus() != null ? req.getStatus().trim().toUpperCase() : "ACTIVE");
        entity.setTollIncluded(Boolean.TRUE.equals(req.getTollIncluded()));
        entity.setDiscountPercentage(req.getDiscountPercentage() != null ? req.getDiscountPercentage() : BigDecimal.ZERO);
        entity.setPetCharge(req.getPetCharge() != null ? req.getPetCharge() : BigDecimal.ZERO);
        entity.setVendorPetCharge(req.getVendorPetCharge() != null ? req.getVendorPetCharge() : BigDecimal.ZERO);

        AirportTariff saved = airportTariffRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTariff(UUID id) {
        if (!airportTariffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Airport tariff not found with id: " + id);
        }
        airportTariffRepository.deleteById(id);
    }

    @Transactional
    public AirportTariffResponse toggleStatus(UUID id, String status) {
        AirportTariff entity = airportTariffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Airport tariff not found with id: " + id));
        entity.setStatus("ACTIVE".equalsIgnoreCase(status) ? "ACTIVE" : "INACTIVE");
        return mapToResponse(airportTariffRepository.save(entity));
    }

    /**
     * Resolves the best matching Airport Tariff slab for a customer enquiry.
     */
    @Transactional(readOnly = true)
    public Optional<AirportTariff> findMatchingTariff(
            String city,
            String state,
            String tripDirection, // "CITY_TO_AIRPORT" (Drop) or "AIRPORT_TO_CITY" (Pickup)
            String category,
            int distanceKm,
            LocalDate date,
            LocalTime time
    ) {
        return findMatchingTariff(city, state, tripDirection, category, null, distanceKm, date, time);
    }

    @Transactional(readOnly = true)
    public Optional<AirportTariff> findMatchingTariff(
            String city,
            String state,
            String tripDirection,
            String category,
            String modelName,
            int distanceKm,
            LocalDate date,
            LocalTime time
    ) {
        List<AirportTariff> activeTariffs = airportTariffRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE");
        if (activeTariffs.isEmpty()) {
            return Optional.empty();
        }

        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        LocalTime effectiveTime = (time != null) ? time : LocalTime.now();
        DayOfWeek dow = effectiveDate.getDayOfWeek();
        String dayAbbr = dow.name().substring(0, 3); // MON, TUE, WED, etc.

        // First pass: Seasonal pricing matching this exact date
        List<AirportTariff> seasonal = activeTariffs.stream()
                .filter(t -> "SEASONAL".equalsIgnoreCase(t.getPricingType()))
                .filter(t -> isDateValid(t, effectiveDate))
                .filter(t -> isScheduleValid(t, dayAbbr, effectiveTime))
                .filter(t -> isDirectionMatching(t, tripDirection))
                .filter(t -> isCategoryMatching(t, category))
                .filter(t -> isModelMatching(t, modelName))
                .filter(t -> isDistanceMatching(t, distanceKm))
                .collect(Collectors.toList());

        Optional<AirportTariff> bestSeasonal = selectBestLocationMatch(seasonal, city, state);
        if (bestSeasonal.isPresent()) {
            return bestSeasonal;
        }

        // Second pass: Regular pricing
        List<AirportTariff> regular = activeTariffs.stream()
                .filter(t -> "REGULAR".equalsIgnoreCase(t.getPricingType()))
                .filter(t -> isDateValid(t, effectiveDate))
                .filter(t -> isScheduleValid(t, dayAbbr, effectiveTime))
                .filter(t -> isDirectionMatching(t, tripDirection))
                .filter(t -> isCategoryMatching(t, category))
                .filter(t -> isModelMatching(t, modelName))
                .filter(t -> isDistanceMatching(t, distanceKm))
                .collect(Collectors.toList());

        return selectBestLocationMatch(regular, city, state);
    }

    private boolean isModelMatching(AirportTariff t, String modelName) {
        if (t.getModelName() == null || t.getModelName().isBlank() || "ALL".equalsIgnoreCase(t.getModelName().trim())) {
            return true;
        }
        if (modelName == null || modelName.isBlank()) {
            return true;
        }
        String tModel = t.getModelName().trim().toLowerCase();
        String m = modelName.trim().toLowerCase();
        return m.contains(tModel) || tModel.contains(m);
    }

    private boolean isDateValid(AirportTariff t, LocalDate date) {
        if ("FIXED_DAYS".equalsIgnoreCase(t.getExpiryType())) {
            if (t.getStartDate() != null && date.isBefore(t.getStartDate())) return false;
            if (t.getEndDate() != null && date.isAfter(t.getEndDate())) return false;
        }
        return true;
    }

    private boolean isScheduleValid(AirportTariff t, String dayAbbr, LocalTime time) {
        // Day of week check
        String days = t.getDaysOfWeek();
        if (days != null && !days.isBlank() && !"ALL".equalsIgnoreCase(days)) {
            boolean matchedDay = Arrays.stream(days.split(","))
                    .map(String::trim)
                    .anyMatch(d -> d.equalsIgnoreCase(dayAbbr));
            if (!matchedDay) return false;
        }

        // Time slot check
        String slotType = t.getTimeSlotType();
        if ("DAY".equalsIgnoreCase(slotType)) {
            return !time.isBefore(LocalTime.of(6, 0)) && !time.isAfter(LocalTime.of(21, 59));
        } else if ("NIGHT".equalsIgnoreCase(slotType)) {
            return time.isAfter(LocalTime.of(21, 59)) || time.isBefore(LocalTime.of(6, 0));
        } else if ("CUSTOM".equalsIgnoreCase(slotType)) {
            try {
                if (t.getTimeRangeStart() != null && t.getTimeRangeEnd() != null) {
                    LocalTime start = LocalTime.parse(t.getTimeRangeStart().trim());
                    LocalTime end = LocalTime.parse(t.getTimeRangeEnd().trim());
                    if (start.isBefore(end)) {
                        return !time.isBefore(start) && !time.isAfter(end);
                    } else {
                        // Spans midnight e.g. 22:00 to 05:00
                        return !time.isBefore(start) || !time.isAfter(end);
                    }
                }
            } catch (Exception ignored) {}
        }

        return true; // ALL_DAY
    }

    @Transactional(readOnly = true)
    public boolean isCityServiceable(String city, String state) {
        if (city == null || city.isBlank()) return true;
        String cleanCity = city.trim();
        String cleanState = (state != null) ? state.trim() : "";

        List<AirportTariff> activeTariffs = airportTariffRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE");
        if (activeTariffs.isEmpty()) {
            return false;
        }

        return activeTariffs.stream().anyMatch(t -> {
            String tCity = t.getCity();
            String tState = t.getState();
            boolean cityMatches = (tCity == null || tCity.isBlank() || "ALL".equalsIgnoreCase(tCity.trim()) || VehicleTariffService.areCitiesEqual(cleanCity, tCity));
            boolean stateMatches = (cleanState.isEmpty() || tState == null || tState.isBlank() || "ALL".equalsIgnoreCase(tState.trim()) || cleanState.equalsIgnoreCase(tState.trim()));
            return cityMatches && stateMatches;
        });
    }

    @Transactional(readOnly = true)
    public List<AirportTariff> getAllActiveTariffs() {
        return airportTariffRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("ACTIVE");
    }

    private boolean isDirectionMatching(AirportTariff t, String tripDirection) {
        if (tripDirection == null || tripDirection.isBlank()) return true;
        if ("BOTH".equalsIgnoreCase(t.getTripDirection())) return true;
        
        String dir = tripDirection.trim().toUpperCase();
        // Support variations: "DROP", "CITY_TO_AIRPORT", "PICKUP", "AIRPORT_TO_CITY"
        if (dir.contains("DROP") || dir.contains("CITY_TO_AIRPORT")) {
            return "CITY_TO_AIRPORT".equalsIgnoreCase(t.getTripDirection()) || "BOTH".equalsIgnoreCase(t.getTripDirection());
        } else if (dir.contains("PICKUP") || dir.contains("AIRPORT_TO_CITY")) {
            return "AIRPORT_TO_CITY".equalsIgnoreCase(t.getTripDirection()) || "BOTH".equalsIgnoreCase(t.getTripDirection());
        }
        if ("ONE_WAY".equalsIgnoreCase(dir) || "ROUND_TRIP".equalsIgnoreCase(dir)) {
            return true;
        }
        return t.getTripDirection().equalsIgnoreCase(dir);
    }

    private boolean isCategoryMatching(AirportTariff t, String category) {
        if (category == null || category.isBlank()) return true;
        if (t.getCategory() == null || t.getCategory().isBlank() || "ALL".equalsIgnoreCase(t.getCategory().trim())) return true;
        return t.getCategory().trim().equalsIgnoreCase(category.trim());
    }

    private boolean isDistanceMatching(AirportTariff t, int distanceKm) {
        int min = (t.getMinKm() != null) ? t.getMinKm() : 0;
        int max = (t.getMaxKm() != null) ? t.getMaxKm() : Integer.MAX_VALUE;
        return distanceKm >= min && distanceKm <= max;
    }

    private Optional<AirportTariff> selectBestLocationMatch(List<AirportTariff> tariffs, String city, String state) {
        if (tariffs.isEmpty()) return Optional.empty();

        // 1. Exact city match
        if (city != null && !city.isBlank()) {
            Optional<AirportTariff> cityMatch = tariffs.stream()
                    .filter(t -> t.getCity() != null && t.getCity().trim().equalsIgnoreCase(city.trim()))
                    .findFirst();
            if (cityMatch.isPresent()) return cityMatch;
        }

        // 2. State match with city == "ALL" or null
        if (state != null && !state.isBlank()) {
            Optional<AirportTariff> stateMatch = tariffs.stream()
                    .filter(t -> t.getState() != null && t.getState().trim().equalsIgnoreCase(state.trim()))
                    .filter(t -> t.getCity() == null || t.getCity().isBlank() || "ALL".equalsIgnoreCase(t.getCity().trim()))
                    .findFirst();
            if (stateMatch.isPresent()) return stateMatch;
        }

        // 3. Fallback to generic "ALL" city and state
        return tariffs.stream()
                .filter(t -> (t.getCity() == null || "ALL".equalsIgnoreCase(t.getCity().trim()))
                          && (t.getState() == null || "ALL".equalsIgnoreCase(t.getState().trim())))
                .findFirst()
                .or(() -> tariffs.stream().findFirst());
    }

    @Transactional
    public void seedDefaultAirportTariffs() {
        if (airportTariffRepository.count() > 0) {
            log.info("Airport tariffs already exist. Skipping seed.");
            return;
        }

        log.info("Seeding default Airport distance slab tariffs...");
        List<AirportTariff> defaultSlabs = new ArrayList<>();

        // Helper method to add slabs
        addHubSlabs(defaultSlabs, "Tamil Nadu", "Chennai", "Chennai International Airport (MAA)");
        addHubSlabs(defaultSlabs, "Karnataka", "Bangalore", "Kempegowda International Airport (BLR)");
        addHubSlabs(defaultSlabs, "Tamil Nadu", "Coimbatore", "Coimbatore International Airport (CJB)");
        addHubSlabs(defaultSlabs, "Tamil Nadu", "Madurai", "Madurai Airport (IXM)");
        addHubSlabs(defaultSlabs, "ALL", "ALL", "ALL");

        airportTariffRepository.saveAll(defaultSlabs);
        log.info("Seeded {} default airport tariff rules successfully.", defaultSlabs.size());
    }

    private void addHubSlabs(List<AirportTariff> list, String state, String city, String airportName) {
        // Sedan: Slabs 0-30km, 30-50km, 50-80km
        list.add(buildSlab(state, city, airportName, "Sedan", "4", 0, 30, new BigDecimal("1299"), new BigDecimal("950"), new BigDecimal("14"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "Sedan", "4", 31, 55, new BigDecimal("1799"), new BigDecimal("1350"), new BigDecimal("14"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "Sedan", "4", 56, 85, new BigDecimal("2399"), new BigDecimal("1850"), new BigDecimal("14"), "BOTH", "REGULAR"));

        // Hatchback: Slabs 0-30km, 30-50km
        list.add(buildSlab(state, city, airportName, "Hatchback", "4", 0, 30, new BigDecimal("1099"), new BigDecimal("800"), new BigDecimal("12"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "Hatchback", "4", 31, 55, new BigDecimal("1499"), new BigDecimal("1150"), new BigDecimal("12"), "BOTH", "REGULAR"));

        // SUV: Slabs 0-30km, 30-55km, 56-85km
        list.add(buildSlab(state, city, airportName, "SUV", "6", 0, 30, new BigDecimal("1899"), new BigDecimal("1450"), new BigDecimal("18"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "SUV", "6", 31, 55, new BigDecimal("2599"), new BigDecimal("2000"), new BigDecimal("18"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "SUV", "6", 56, 85, new BigDecimal("3299"), new BigDecimal("2600"), new BigDecimal("18"), "BOTH", "REGULAR"));

        // Innova Crysta
        list.add(buildSlab(state, city, airportName, "Innovacrysta", "7", 0, 35, new BigDecimal("2499"), new BigDecimal("1900"), new BigDecimal("21"), "BOTH", "REGULAR"));
        list.add(buildSlab(state, city, airportName, "Innovacrysta", "7", 36, 65, new BigDecimal("3499"), new BigDecimal("2750"), new BigDecimal("21"), "BOTH", "REGULAR"));
    }

    private AirportTariff buildSlab(
            String state, String city, String airportName,
            String category, String seats,
            int minKm, int maxKm,
            BigDecimal custFare, BigDecimal vendFare, BigDecimal extraKm,
            String tripDirection, String pricingType
    ) {
        return AirportTariff.builder()
                .title(city + " " + category + " Airport Transfer (" + minKm + "-" + maxKm + " km)")
                .state(state)
                .city(city)
                .airportName(airportName)
                .category(category)
                .modelName("ALL")
                .seatingCapacity(seats)
                .fuelType("ALL")
                .minKm(minKm)
                .maxKm(maxKm)
                .customerFare(custFare)
                .vendorFare(vendFare)
                .extraKmRate(extraKm)
                .vendorExtraKmRate(extraKm.multiply(new BigDecimal("0.80")).setScale(2, java.math.RoundingMode.HALF_UP))
                .tripDirection(tripDirection)
                .pricingType(pricingType)
                .daysOfWeek("ALL")
                .timeSlotType("ALL_DAY")
                .expiryType("NEVER")
                .status("ACTIVE")
                .tollIncluded(false)
                .discountPercentage(BigDecimal.ZERO)
                .petCharge(new BigDecimal("300.00"))
                .vendorPetCharge(new BigDecimal("200.00"))
                .build();
    }

    private AirportTariffResponse mapToResponse(AirportTariff t) {
        return AirportTariffResponse.builder()
                .id(t.getId())
                .tripDirection(t.getTripDirection())
                .pricingType(t.getPricingType())
                .title(t.getTitle())
                .state(t.getState())
                .city(t.getCity())
                .airportName(t.getAirportName())
                .minKm(t.getMinKm())
                .maxKm(t.getMaxKm())
                .category(t.getCategory())
                .modelName(t.getModelName())
                .seatingCapacity(t.getSeatingCapacity())
                .fuelType(t.getFuelType())
                .customerFare(t.getCustomerFare())
                .vendorFare(t.getVendorFare())
                .extraKmRate(t.getExtraKmRate())
                .vendorExtraKmRate(t.getVendorExtraKmRate())
                .daysOfWeek(t.getDaysOfWeek())
                .timeSlotType(t.getTimeSlotType())
                .timeRangeStart(t.getTimeRangeStart())
                .timeRangeEnd(t.getTimeRangeEnd())
                .expiryType(t.getExpiryType())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .status(t.getStatus())
                .tollIncluded(t.getTollIncluded())
                .discountPercentage(t.getDiscountPercentage())
                .petCharge(t.getPetCharge())
                .vendorPetCharge(t.getVendorPetCharge())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}

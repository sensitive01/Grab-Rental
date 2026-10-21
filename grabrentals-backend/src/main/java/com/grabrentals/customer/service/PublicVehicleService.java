package com.grabrentals.customer.service;

import com.grabrentals.customer.dto.PublicVehicleCardDto;
import com.grabrentals.customer.dto.VehicleSearchResponseDto;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.tariff.dto.VehicleModelConfigResponse;
import com.grabrentals.tariff.entity.VehicleTariff;
import com.grabrentals.tariff.service.VehicleTariffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicVehicleService {

    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final VehicleTariffService vehicleTariffService;
    private final com.grabrentals.tariff.service.PricingTaxConfigService pricingTaxConfigService;
    private final com.grabrentals.tariff.service.DriverAllowanceService driverAllowanceService;

    public BookingResponse getBookingByReference(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));
        return BookingResponse.fromEntity(booking);
    }

    public VehicleSearchResponseDto searchVehicles(String from, String to, String tripType, String pickupDate, String pickupTime) {
        return searchVehicles(from, to, null, tripType, pickupDate, pickupTime, "OUTSTATION");
    }

    public VehicleSearchResponseDto searchVehicles(String from, String to, String stops, String tripType, String pickupDate, String pickupTime) {
        return searchVehicles(from, to, stops, tripType, pickupDate, pickupTime, "OUTSTATION");
    }

    /**
     * Search available vehicles for an outstation or local route with real pricing calculations.
     */
    public VehicleSearchResponseDto searchVehicles(String from, String to, String stops, String tripType, String pickupDate, String pickupTime, String serviceType) {
        return searchVehicles(from, null, to, null, stops, tripType, pickupDate, pickupTime, null, null, serviceType, null);
    }

    public VehicleSearchResponseDto searchVehicles(String from, String to, String stops, String tripType, String pickupDate, String pickupTime, String serviceType, Integer overrideDistanceKm) {
        return searchVehicles(from, null, to, null, stops, tripType, pickupDate, pickupTime, null, null, serviceType, overrideDistanceKm);
    }

    public VehicleSearchResponseDto searchVehicles(String from, String fromCity, String to, String stops, String tripType, String pickupDate, String pickupTime, String serviceType, Integer overrideDistanceKm) {
        return searchVehicles(from, fromCity, to, null, stops, tripType, pickupDate, pickupTime, null, null, serviceType, overrideDistanceKm);
    }

    public VehicleSearchResponseDto searchVehicles(
            String from, String fromCity, String to, String toCity, String stops, String tripType,
            String pickupDate, String pickupTime, String returnDate, Integer tripDays,
            String serviceType, Integer overrideDistanceKm
    ) {
        String cleanFrom = (from != null && !from.isBlank()) ? from.trim() : "Bangalore";
        String cleanTo = (to != null && !to.isBlank()) ? to.trim() : "Coimbatore";
        String normalizedTripType = (tripType != null && tripType.toLowerCase().contains("round")) ? "Round trip" : "One way";
        String resolvedServiceType = (serviceType != null && !serviceType.isBlank()) ? serviceType.trim().toUpperCase() : "OUTSTATION";
        if ("PACKAGE".equalsIgnoreCase(resolvedServiceType)) {
            resolvedServiceType = "LOCAL";
        } else if ("OUTSTATION".equalsIgnoreCase(resolvedServiceType)) {
            resolvedServiceType = (tripType != null && tripType.toLowerCase().contains("round")) ? "ROUND_TRIP" : "ONE_WAY";
        }

        List<String> parsedStops = new ArrayList<>();
        if (stops != null && !stops.isBlank()) {
            String[] parts = stops.split("\\|");
            for (String p : parts) {
                if (p != null && !p.trim().isBlank()) {
                    parsedStops.add(p.trim());
                }
            }
        }

        long t0 = System.currentTimeMillis();
        int pkgHours = 8;
        int pkgKm = 80;
        int distanceKm = 80;
        if ("LOCAL".equalsIgnoreCase(resolvedServiceType)) {
            String packageKey = (cleanTo != null ? cleanTo.toLowerCase() : "");
            if (packageKey.contains("4hr") || packageKey.contains("40")) {
                pkgHours = 4;
                pkgKm = 40;
            } else if (packageKey.contains("12hr") || packageKey.contains("120")) {
                pkgHours = 12;
                pkgKm = 120;
            } else {
                pkgHours = 8;
                pkgKm = 80;
            }
            distanceKm = pkgKm;
        } else if (overrideDistanceKm != null && overrideDistanceKm > 0) {
            distanceKm = overrideDistanceKm;
        } else {
            distanceKm = calculateDistanceWithStops(cleanFrom, cleanTo, parsedStops, normalizedTripType);
        }

        int effectiveDays = 1;
        if (tripDays != null && tripDays > 0) {
            effectiveDays = tripDays;
        } else if (pickupDate != null && returnDate != null) {
            try {
                java.time.LocalDate d1 = java.time.LocalDate.parse(pickupDate.trim().substring(0, 10));
                java.time.LocalDate d2 = java.time.LocalDate.parse(returnDate.trim().substring(0, 10));
                long between = java.time.temporal.ChronoUnit.DAYS.between(d1, d2);
                effectiveDays = Math.max(1, (int) between + 1);
            } catch (Exception ignored) {}
        }

        boolean isRoundTrip = "ROUND_TRIP".equalsIgnoreCase(resolvedServiceType)
                || (tripType != null && tripType.toLowerCase().contains("round"));
        boolean isOneWay = "ONE_WAY".equalsIgnoreCase(resolvedServiceType)
                || (!isRoundTrip && !"LOCAL".equalsIgnoreCase(resolvedServiceType) && !"AIRPORT".equalsIgnoreCase(resolvedServiceType));
        int effectiveDistance = distanceKm;
        if (isRoundTrip) {
            int minDailyKm = effectiveDays * 250;
            effectiveDistance = Math.max(distanceKm, minDailyKm);
        } else if (isOneWay) {
            int minOneWayKm = 250;
            effectiveDistance = Math.max(distanceKm, minOneWayKm);
        }

        long tDist = System.currentTimeMillis();

        String lookupString = (fromCity != null && !fromCity.isBlank()) ? fromCity.trim() : cleanFrom;
        String[] cityAndState = extractCityAndState(lookupString);
        String pickupCity = cityAndState[0];
        String pickupState = cityAndState[1];

        // Fetch all tariffs for this service type in ONE single query (O(1) DB hit)
        List<VehicleTariff> tariffs = vehicleTariffService.getTariffsForService(resolvedServiceType);

        boolean serviceable = vehicleTariffService.isCityServiceable(pickupCity, pickupState, resolvedServiceType, tariffs);
        long tCity = System.currentTimeMillis();
        log.info("[PERF] distance & city check took {} ms", (tCity - t0));

        if (!serviceable) {
            return VehicleSearchResponseDto.builder()
                    .from(cleanFrom)
                    .to(cleanTo)
                    .stops(parsedStops.isEmpty() ? null : parsedStops)
                    .tripType(normalizedTripType)
                    .distanceKm(effectiveDistance)
                    .pickupDate(pickupDate)
                    .pickupTime(pickupTime)
                    .returnDate(returnDate)
                    .tripDays(effectiveDays)
                    .vehicles(Collections.emptyList())
                    .serviceAvailable(false)
                    .serviceCity(pickupCity)
                    .serviceMessage("Service will Be Soon in " + pickupCity)
                    .build();
        }

        // Priority 1: Use active Vehicle Models configured by Admin in the catalog
        List<VehicleModelConfigResponse> activeConfigs = new ArrayList<>(
                vehicleTariffService.getActiveModelConfigs() != null ? vehicleTariffService.getActiveModelConfigs() : Collections.emptyList()
        );

        // Auto-include any models configured in active tariffs for this service that are not yet in vehicle_model_configs
        Set<String> existingModelKeys = new HashSet<>();
        for (VehicleModelConfigResponse c : activeConfigs) {
            String k = (c.getModelName() != null ? c.getModelName().trim().toLowerCase() : "") + "_"
                    + (c.getCategory() != null ? c.getCategory().trim().toLowerCase() : "");
            existingModelKeys.add(k);
        }

        if (tariffs != null) {
            for (VehicleTariff t : tariffs) {
                if (t.getModelName() == null || t.getModelName().isBlank()) continue;
                // Only consider tariffs matching this city/state
                boolean matchesCity = (t.getCity() != null && VehicleTariffService.areCitiesEqual(pickupCity, t.getCity()));
                boolean matchesState = (t.getState() != null && pickupState != null && t.getState().trim().equalsIgnoreCase(pickupState.trim()));
                boolean isAllLocation = (t.getCity() == null || t.getCity().isBlank() || "all".equalsIgnoreCase(t.getCity().trim()));

                if (!matchesCity && !matchesState && !isAllLocation) {
                    continue;
                }

                String modelKey = t.getModelName().trim().toLowerCase() + "_"
                        + (t.getCategory() != null ? t.getCategory().trim().toLowerCase() : "");
                if (!existingModelKeys.contains(modelKey)) {
                    existingModelKeys.add(modelKey);
                    VehicleModelConfigResponse synthetic = VehicleModelConfigResponse.builder()
                            .modelName(t.getModelName().trim())
                            .category(t.getCategory() != null ? t.getCategory().trim() : "Hatchback")
                            .seatingCapacity(t.getSeatingCapacity() != null ? t.getSeatingCapacity().trim() : "4")
                            .fuelType(t.getFuelType() != null ? t.getFuelType().trim() : "Diesel")
                            .active(true)
                            .commonPhotoUrl(vehicleTariffService.resolveCommonPhoto(t.getCategory(), t.getModelName(), t.getSeatingCapacity()))
                            .build();
                    activeConfigs.add(synthetic);
                }
            }
        }

        long tConfigs = System.currentTimeMillis();

        List<PublicVehicleCardDto> cards = new ArrayList<>();

        if (!activeConfigs.isEmpty()) {
            for (VehicleModelConfigResponse config : activeConfigs) {
                String model = (config.getModelName() != null && !config.getModelName().isBlank())
                        ? config.getModelName().trim()
                        : "Standard Fleet";
                int seats = 4;
                try {
                    if (config.getSeatingCapacity() != null && !config.getSeatingCapacity().isBlank()) {
                        seats = Integer.parseInt(config.getSeatingCapacity().trim());
                    }
                } catch (Exception ignored) {}

                // Dynamically resolve rate using Tariff Engine in-memory against pre-fetched tariffs
                Map<String, Object> rateContext = vehicleTariffService.calculateRate(
                        config.getCategory(), model, String.valueOf(seats), config.getFuelType(), pickupDate, pickupTime, resolvedServiceType, pickupCity, pickupState, tariffs
                );

                Boolean hasTariff = (Boolean) rateContext.get("hasTariff");
                if (hasTariff == null || !hasTariff) {
                    // Only show car models where pricing/tariff has been added by admin for this service type
                    continue;
                }

                BigDecimal rate = (BigDecimal) rateContext.get("ratePerKm");
                if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
                    rate = getDefaultRateForType(config.getCategory(), seats);
                }
                BigDecimal postRate = rate.add(new BigDecimal("1.00"));

                String category = mapVehicleCategory(config.getCategory(), seats);
                String typeTitle = (config.getCategory() != null && !config.getCategory().isBlank())
                        ? config.getCategory()
                        : (category.contains("SUV") ? "SUV" : category.contains("SEDAN") ? "Sedan" : "Hatchback");

                String image = (config.getCommonPhotoUrl() != null && !config.getCommonPhotoUrl().isBlank())
                        ? config.getCommonPhotoUrl()
                        : resolveVehicleImage(model, category, null);

                String badge = (Boolean.TRUE.equals(rateContext.get("isSeasonal")))
                        ? (rateContext.get("seasonName") != null ? rateContext.get("seasonName").toString() : "Festive Special")
                        : getVehicleBadge(model, category);
                double rating = getVehicleRating(model, category);
                int ratingCount = 500;
                String cardId = config.getId() != null ? config.getId().toString() : model.toLowerCase().replaceAll("[^a-z0-9]+", "_");

                String fuel = (config.getFuelType() != null && !config.getFuelType().isBlank()) ? config.getFuelType() : "Diesel";
                BigDecimal baseFare = (BigDecimal) rateContext.get("baseFare");
                Integer baseKm = (rateContext.get("baseIncludedKm") != null) ? (Integer) rateContext.get("baseIncludedKm") : 250;
                if (baseKm == null || baseKm <= 0) baseKm = 250;
                BigDecimal dailyPrice = (baseFare != null && baseFare.compareTo(BigDecimal.ZERO) > 0)
                        ? baseFare
                        : rate.multiply(BigDecimal.valueOf(baseKm)).setScale(0, RoundingMode.HALF_UP);

                if ("LOCAL".equalsIgnoreCase(resolvedServiceType)) {
                    BigDecimal hourlyFare = (BigDecimal) rateContext.get("hourlyCustomerFare");
                    Integer tariffPkgHours = (rateContext.get("packageHours") != null) ? (Integer) rateContext.get("packageHours") : 8;
                    if (tariffPkgHours == null || tariffPkgHours <= 0) tariffPkgHours = 8;

                    if (hourlyFare != null && hourlyFare.compareTo(BigDecimal.ZERO) > 0) {
                        if (pkgHours == tariffPkgHours) {
                            dailyPrice = hourlyFare;
                        } else {
                            dailyPrice = hourlyFare.multiply(BigDecimal.valueOf(pkgHours))
                                    .divide(BigDecimal.valueOf(tariffPkgHours), 0, RoundingMode.HALF_UP);
                        }
                    } else {
                        dailyPrice = rate.multiply(BigDecimal.valueOf(pkgKm))
                                .add(BigDecimal.valueOf(pkgHours * 100))
                                .setScale(0, RoundingMode.HALF_UP);
                    }
                }

                BigDecimal discPct = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                PublicVehicleCardDto card = buildCategoryCard(
                        cardId,
                        model + " or Equivalent",
                        typeTitle + " • AC • " + seats + " Seats",
                        category,
                        rating,
                        ratingCount,
                        seats,
                        image,
                        effectiveDistance,
                        rate,
                        postRate,
                        List.of(fuel),
                        5,
                        badge,
                        discPct,
                        isRoundTrip,
                        model,
                        pickupCity,
                        pickupState,
                        pickupTime,
                        effectiveDays
                );
                card.setVehicleType(typeTitle);
                card.setFuelType(fuel);
                card.setTransmission("Manual / Automatic");
                card.setYear(2024);
                card.setDailyPrice(dailyPrice);
                card.setPerKmRate(rate);
                card.setLocation(cleanFrom);
                card.setStatus("AVAILABLE");
                card.setChauffeur("Verified Commercial Chauffeur");
                card.setChauffeurRating(4.9);
                card.setDescription(config.getDescription());
                if (!"LOCAL".equalsIgnoreCase(resolvedServiceType) && !"AIRPORT".equalsIgnoreCase(resolvedServiceType)) {
                    card.setIncludedKms(isRoundTrip ? (effectiveDays * 250) : baseKm);
                }

                if ("LOCAL".equalsIgnoreCase(resolvedServiceType)) {
                    BigDecimal discPctLocal = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                    BigDecimal originalLocal = dailyPrice;
                    BigDecimal discountedLocal = dailyPrice;
                    if (discPctLocal != null && discPctLocal.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal discRate = discPctLocal.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                        discountedLocal = originalLocal.subtract(originalLocal.multiply(discRate)).setScale(0, RoundingMode.HALF_UP);
                    }
                    BigDecimal adv = discountedLocal.multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);
                    card.setPricing(PublicVehicleCardDto.PublicPricingDto.builder()
                            .originalPrice(originalLocal)
                            .discountedPrice(discountedLocal)
                            .baseFare(discountedLocal)
                            .chargesAndTaxes(BigDecimal.ZERO)
                            .advanceAmount(adv)
                            .discountPercentage(discPctLocal)
                            .build());
                    card.setDailyPrice(discountedLocal);
                    card.setIncludedKms(pkgKm);
                    card.setInclusions(List.of(
                            "Fixed package for " + pkgHours + " Hours and " + pkgKm + " Kilometers",
                            "Commercial Chauffeur with Local City Route Mastery",
                            "Chauffeur on standby during all your stops",
                            "Fuel Charges Included for " + pkgKm + " km"
                    ));
                    BigDecimal extraKm = (rateContext.get("extraKmRate") != null) ? (BigDecimal) rateContext.get("extraKmRate") : postRate;
                    BigDecimal extraHr = (rateContext.get("extraHourRate") != null) ? (BigDecimal) rateContext.get("extraHourRate") : new BigDecimal("150.00");
                    card.setExclusions(List.of(
                            "Extra Distance: ₹" + extraKm + "/km after " + pkgKm + " km",
                            "Extra Time: ₹" + extraHr + "/hr after " + pkgHours + " hours",
                            "Toll and Parking charges (if any) payable directly at actuals"
                    ));
                } else if ("AIRPORT".equalsIgnoreCase(resolvedServiceType)) {
                    Integer airportKm = (Integer) rateContext.get("airportIncludedKm");
                    if (airportKm == null || airportKm <= 0) airportKm = 35;
                    BigDecimal discPctAirport = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                    BigDecimal originalAirport = dailyPrice;
                    BigDecimal discountedAirport = dailyPrice;
                    if (discPctAirport != null && discPctAirport.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal discRate = discPctAirport.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                        discountedAirport = originalAirport.subtract(originalAirport.multiply(discRate)).setScale(0, RoundingMode.HALF_UP);
                    }
                    BigDecimal adv = discountedAirport.multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);
                    card.setPricing(PublicVehicleCardDto.PublicPricingDto.builder()
                            .originalPrice(originalAirport)
                            .discountedPrice(discountedAirport)
                            .baseFare(discountedAirport)
                            .chargesAndTaxes(BigDecimal.ZERO)
                            .advanceAmount(adv)
                            .discountPercentage(discPctAirport)
                            .build());
                    card.setDailyPrice(discountedAirport);
                    card.setIncludedKms(airportKm);
                    card.setInclusions(List.of(
                            "Guaranteed Airport Transfer (" + airportKm + " km Included)",
                            "Live Flight Delay Tracking Included",
                            "Free 60 Minutes Waiting Time at Arrivals",
                            "Chauffeur Meet & Greet with Placard & Luggage Help",
                            "Fuel Charges Included"
                    ));
                    BigDecimal extraKm = (rateContext.get("airportExtraKmRate") != null)
                            ? (BigDecimal) rateContext.get("airportExtraKmRate")
                            : postRate;
                    card.setExclusions(List.of(
                            "Extra KM Charge: ₹" + extraKm + "/km beyond " + airportKm + " km",
                            "Airport Toll & Parking (if applicable) at actuals"
                    ));
                }

                if (card.getPricing() != null) {
                    card.getPricing().setPetCharge((BigDecimal) rateContext.get("petCharge"));
                    card.getPricing().setVendorPetCharge((BigDecimal) rateContext.get("vendorPetCharge"));
                }

                cards.add(card);
            }
        } else {
            // Fallback: check individual vehicles in inventory if no catalog models configured
            List<Vehicle> availableVehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE);
            for (Vehicle v : availableVehicles) {
                String model = (v.getModel() != null && !v.getModel().isBlank()) ? v.getModel().trim() : "Standard Fleet";
                int seats = v.getSeatingCapacity() != null ? v.getSeatingCapacity() : 4;

                Map<String, Object> rateContext = vehicleTariffService.calculateRate(
                        v.getVehicleType(), model, String.valueOf(seats), v.getFuelType(), pickupDate, pickupTime, resolvedServiceType, pickupCity, pickupState, tariffs
                );
                Boolean hasTariff = (Boolean) rateContext.get("hasTariff");
                if (hasTariff == null || !hasTariff) {
                    continue;
                }
                    BigDecimal rate = (BigDecimal) rateContext.get("ratePerKm");
                    if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
                        rate = (v.getPerKmRate() != null && v.getPerKmRate().compareTo(BigDecimal.ZERO) > 0)
                                ? v.getPerKmRate()
                                : getDefaultRateForType(v.getVehicleType(), seats);
                    }
                    BigDecimal postRate = rate.add(new BigDecimal("1.00"));

                    String category = mapVehicleCategory(v.getVehicleType(), seats);
                    String typeTitle = (v.getVehicleType() != null && !v.getVehicleType().isBlank())
                            ? v.getVehicleType()
                            : (category.contains("SUV") ? "SUV" : category.contains("SEDAN") ? "Sedan" : "Hatchback");

                    String commonPhoto = vehicleTariffService.resolveCommonPhoto(v.getVehicleType(), model, String.valueOf(seats));
                    String image = (commonPhoto != null && !commonPhoto.isBlank()) ? commonPhoto : resolveVehicleImage(model, category, v.getImageUrl());
                    String badge = (Boolean.TRUE.equals(rateContext.get("isSeasonal")))
                            ? (rateContext.get("seasonName") != null ? rateContext.get("seasonName").toString() : "Festive Special")
                            : getVehicleBadge(model, category);
                    double rating = getVehicleRating(model, category);
                    int ratingCount = 500;
                    String cardId = v.getId() != null ? v.getId().toString() : model.toLowerCase().replaceAll("[^a-z0-9]+", "_");

                    String fuel = (v.getFuelType() != null && !v.getFuelType().isBlank()) ? v.getFuelType() : "Diesel";
                    String trans = (v.getTransmission() != null && !v.getTransmission().isBlank()) ? v.getTransmission() : "Manual";
                    int yr = v.getYear() != null ? v.getYear() : 2023;
                    BigDecimal dailyPrice = (v.getDailyRate() != null && v.getDailyRate().compareTo(BigDecimal.ZERO) > 0)
                            ? v.getDailyRate()
                            : rate.multiply(BigDecimal.valueOf(250)).setScale(0, RoundingMode.HALF_UP);
                    if ("LOCAL".equalsIgnoreCase(resolvedServiceType)) {
                        BigDecimal hourlyFare = (BigDecimal) rateContext.get("hourlyCustomerFare");
                        Integer tariffPkgHours = (rateContext.get("packageHours") != null) ? (Integer) rateContext.get("packageHours") : 8;
                        if (tariffPkgHours == null || tariffPkgHours <= 0) tariffPkgHours = 8;

                        if (hourlyFare != null && hourlyFare.compareTo(BigDecimal.ZERO) > 0) {
                            if (pkgHours == tariffPkgHours) {
                                dailyPrice = hourlyFare;
                            } else {
                                dailyPrice = hourlyFare.multiply(BigDecimal.valueOf(pkgHours))
                                        .divide(BigDecimal.valueOf(tariffPkgHours), 0, RoundingMode.HALF_UP);
                            }
                        } else {
                            dailyPrice = rate.multiply(BigDecimal.valueOf(pkgKm))
                                    .add(BigDecimal.valueOf(pkgHours * 100))
                                    .setScale(0, RoundingMode.HALF_UP);
                        }
                    } else if ("AIRPORT".equalsIgnoreCase(resolvedServiceType)) {
                        BigDecimal airportFare = (BigDecimal) rateContext.get("airportCustomerFare");
                        Integer airportKm = (Integer) rateContext.get("airportIncludedKm");
                        if (airportKm == null || airportKm <= 0) airportKm = 35;
                        if (airportFare != null && airportFare.compareTo(BigDecimal.ZERO) > 0) {
                            dailyPrice = airportFare;
                        } else {
                            dailyPrice = rate.multiply(BigDecimal.valueOf(airportKm))
                                    .add(new BigDecimal("350.00"))
                                    .setScale(0, RoundingMode.HALF_UP);
                        }
                    }
                    String loc = v.getParkingLocation() != null && !v.getParkingLocation().isBlank()
                            ? v.getParkingLocation()
                            : (v.getCurrentLocation() != null && !v.getCurrentLocation().isBlank() ? v.getCurrentLocation() : cleanFrom);
                    String chauffeurName = (v.getUser() != null && v.getUser().getName() != null && !v.getUser().getName().isBlank())
                            ? v.getUser().getName()
                            : "Verified Commercial Chauffeur";

                    BigDecimal discPct = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                    PublicVehicleCardDto card = buildCategoryCard(
                            cardId,
                            model,
                            typeTitle + " • AC • " + seats + " Seats",
                            category,
                            rating,
                            ratingCount,
                            seats,
                            image,
                            effectiveDistance,
                            rate,
                            postRate,
                            List.of(fuel),
                            1,
                            badge,
                            discPct,
                            isRoundTrip,
                            model,
                            pickupCity,
                            pickupState,
                            pickupTime,
                            effectiveDays
                    );
                    card.setVehicleNumber(v.getVehicleNumber());
                    card.setRegNumber(v.getRegistrationNumber() != null && !v.getRegistrationNumber().isBlank() ? v.getRegistrationNumber() : v.getVehicleNumber());
                    card.setVehicleType(typeTitle);
                    card.setFuelType(fuel);
                    card.setTransmission(trans);
                    card.setYear(yr);
                    card.setDailyPrice(dailyPrice);
                    card.setPerKmRate(rate);
                    card.setLocation(loc);
                    card.setStatus(v.getStatus() != null ? v.getStatus().name() : "AVAILABLE");
                    card.setChauffeur(chauffeurName);
                    card.setChauffeurRating(4.9);
                    if (!"LOCAL".equalsIgnoreCase(resolvedServiceType) && !"AIRPORT".equalsIgnoreCase(resolvedServiceType)) {
                        Integer baseKm = (rateContext.get("baseIncludedKm") != null) ? (Integer) rateContext.get("baseIncludedKm") : 250;
                        card.setIncludedKms(isRoundTrip ? (effectiveDays * 250) : baseKm);
                    }

                    if ("LOCAL".equalsIgnoreCase(resolvedServiceType)) {
                        BigDecimal discPctLocal = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                        BigDecimal originalLocal = dailyPrice;
                        BigDecimal discountedLocal = dailyPrice;
                        if (discPctLocal != null && discPctLocal.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal discRate = discPctLocal.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                            discountedLocal = originalLocal.subtract(originalLocal.multiply(discRate)).setScale(0, RoundingMode.HALF_UP);
                        }
                        BigDecimal adv = discountedLocal.multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);
                        card.setPricing(PublicVehicleCardDto.PublicPricingDto.builder()
                                .originalPrice(originalLocal)
                                .discountedPrice(discountedLocal)
                                .baseFare(discountedLocal)
                                .chargesAndTaxes(BigDecimal.ZERO)
                                .advanceAmount(adv)
                                .discountPercentage(discPctLocal)
                                .build());
                        card.setDailyPrice(discountedLocal);
                        card.setIncludedKms(pkgKm);
                        card.setInclusions(List.of(
                                "Fixed package for " + pkgHours + " Hours and " + pkgKm + " Kilometers",
                                "Commercial Chauffeur with Local City Route Mastery",
                                "Chauffeur on standby during all your stops",
                                "Fuel Charges Included for " + pkgKm + " km"
                        ));
                        BigDecimal extraKm = (rateContext.get("extraKmRate") != null) ? (BigDecimal) rateContext.get("extraKmRate") : postRate;
                        BigDecimal extraHr = (rateContext.get("extraHourRate") != null) ? (BigDecimal) rateContext.get("extraHourRate") : new BigDecimal("150.00");
                        card.setExclusions(List.of(
                                "Extra KM Charge: ₹" + extraKm + "/km beyond " + pkgKm + " km",
                                "Extra Hour Charge: ₹" + extraHr + "/hr beyond " + pkgHours + " hours",
                                "State Entry Tax, Fastag Tolls & Parking fees at actuals"
                        ));
                    } else if ("AIRPORT".equalsIgnoreCase(resolvedServiceType)) {
                        Integer airportKm = (Integer) rateContext.get("airportIncludedKm");
                        if (airportKm == null || airportKm <= 0) airportKm = 35;
                        BigDecimal discPctAirport = (rateContext.get("discountPercentage") != null) ? (BigDecimal) rateContext.get("discountPercentage") : BigDecimal.ZERO;
                        BigDecimal originalAirport = dailyPrice;
                        BigDecimal discountedAirport = dailyPrice;
                        if (discPctAirport != null && discPctAirport.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal discRate = discPctAirport.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                            discountedAirport = originalAirport.subtract(originalAirport.multiply(discRate)).setScale(0, RoundingMode.HALF_UP);
                        }
                        BigDecimal adv = discountedAirport.multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);
                        card.setPricing(PublicVehicleCardDto.PublicPricingDto.builder()
                                .originalPrice(originalAirport)
                                .discountedPrice(discountedAirport)
                                .baseFare(discountedAirport)
                                .chargesAndTaxes(BigDecimal.ZERO)
                                .advanceAmount(adv)
                                .discountPercentage(discPctAirport)
                                .build());
                        card.setDailyPrice(discountedAirport);
                        card.setIncludedKms(airportKm);
                        card.setInclusions(List.of(
                                "Guaranteed Airport Transfer (" + airportKm + " km Included)",
                                "Live Flight Delay Tracking Included",
                                "Free 60 Minutes Waiting Time at Arrivals",
                                "Chauffeur Meet & Greet with Placard & Luggage Help",
                                "Fuel Charges Included"
                        ));
                        BigDecimal extraKm = (rateContext.get("airportExtraKmRate") != null)
                                ? (BigDecimal) rateContext.get("airportExtraKmRate")
                                : postRate;
                        card.setExclusions(List.of(
                                "Extra KM Charge: ₹" + extraKm + "/km beyond " + airportKm + " km",
                                "Airport Toll & Parking (if applicable) at actuals"
                        ));
                    }

                    if (card.getPricing() != null) {
                        card.getPricing().setPetCharge((BigDecimal) rateContext.get("petCharge"));
                        card.getPricing().setVendorPetCharge((BigDecimal) rateContext.get("vendorPetCharge"));
                    }

                    cards.add(card);
                }
            }

        long tDone = System.currentTimeMillis();
        log.info("[PERF] searchVehicles completed in {} ms (cards={})", (tDone - t0), cards.size());

        boolean serviceAvailable = !cards.isEmpty();
        String serviceMsg = serviceAvailable
                ? "Service Active in " + pickupCity
                : "Service will Be Soon in " + pickupCity;

        return VehicleSearchResponseDto.builder()
                .from(cleanFrom)
                .to(cleanTo)
                .stops(parsedStops.isEmpty() ? null : parsedStops)
                .tripType(normalizedTripType)
                .distanceKm(effectiveDistance)
                .pickupDate(pickupDate)
                .pickupTime(pickupTime)
                .returnDate(returnDate)
                .tripDays(effectiveDays)
                .vehicles(cards)
                .serviceAvailable(serviceAvailable)
                .serviceCity(pickupCity)
                .serviceMessage(serviceMsg)
                .build();
    }

    public static String[] extractCityAndState(String locationStr) {
        if (locationStr == null || locationStr.isBlank()) {
            return new String[]{"Bangalore", "Karnataka"};
        }
        String lower = locationStr.toLowerCase();

        // 1. Direct landmark & known hub matching
        if (lower.contains("bangalore") || lower.contains("bengaluru") || lower.contains("basavanagudi") || 
            lower.contains("mallikarjuna") || lower.contains("indiranagar") || lower.contains("koramangala") || 
            lower.contains("whitefield") || lower.contains("jayanagar") || lower.contains("hebbal") || 
            lower.contains("electronic city") || lower.contains("marathahalli") || lower.contains("yelahanka") ||
            lower.contains("rajajinagar") || lower.contains("banashankari") || lower.contains("btm") || lower.contains("hsi")) {
            return new String[]{"Bangalore", "Karnataka"};
        }
        if (lower.contains("coimbatore") || lower.contains("gandhipuram") || lower.contains("peelamedu") || lower.contains("rs puram")) {
            return new String[]{"Coimbatore", "Tamil Nadu"};
        }
        if (lower.contains("chennai") || lower.contains("madras") || lower.contains("t nagar") || lower.contains("adyar") || lower.contains("velachery")) {
            return new String[]{"Chennai", "Tamil Nadu"};
        }
        if (lower.contains("mysore") || lower.contains("mysuru")) return new String[]{"Mysore", "Karnataka"};
        if (lower.contains("hyderabad") || lower.contains("secunderabad") || lower.contains("gachibowli") || lower.contains("hitec city")) return new String[]{"Hyderabad", "Telangana"};
        if (lower.contains("mumbai") || lower.contains("bombay") || lower.contains("bandra") || lower.contains("andheri")) return new String[]{"Mumbai", "Maharashtra"};
        if (lower.contains("pune") || lower.contains("hinjewadi")) return new String[]{"Pune", "Maharashtra"};
        if (lower.contains("delhi") || lower.contains("new delhi") || lower.contains("gurgaon") || lower.contains("noida")) return new String[]{"Delhi", "Delhi"};
        if (lower.contains("madurai")) return new String[]{"Madurai", "Tamil Nadu"};
        if (lower.contains("salem")) return new String[]{"Salem", "Tamil Nadu"};
        if (lower.contains("trichy") || lower.contains("tiruchirappalli")) return new String[]{"Trichy", "Tamil Nadu"};
        if (lower.contains("kochi") || lower.contains("cochin") || lower.contains("ernakulam")) return new String[]{"Kochi", "Kerala"};

        // 2. Check against all known Indian city keys in CITY_COORDS
        for (String cKey : CITY_COORDS.keySet()) {
            if (lower.contains(cKey)) {
                String cName = Character.toUpperCase(cKey.charAt(0)) + cKey.substring(1);
                return new String[]{cName, "India"};
            }
        }

        String[] rawParts = locationStr.split(",");
        List<String> parts = new ArrayList<>();
        for (String p : rawParts) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty()) {
                parts.add(trimmed);
            }
        }
        if (parts.isEmpty()) {
            return new String[]{"Bangalore", "Karnataka"};
        }

        // If last element is "India", remove it
        if (parts.size() > 1 && "India".equalsIgnoreCase(parts.get(parts.size() - 1))) {
            parts.remove(parts.size() - 1);
        }

        if (parts.size() == 1) {
            String rawCity = parts.get(0);
            String cleanedCity = VehicleTariffService.cleanCityLandmarks(rawCity);
            return new String[]{!cleanedCity.isBlank() ? cleanedCity : rawCity, ""};
        }

        // The last part is now the State (strip pincodes)
        String rawState = parts.get(parts.size() - 1);
        String state = rawState.replaceAll("\\b\\d{6}\\b", "").trim();

        // The second to last part is the City (e.g. "Madurai Railway Station" -> "Madurai")
        String rawCity = parts.get(parts.size() - 2);
        String cleanedCity = VehicleTariffService.cleanCityLandmarks(rawCity);
        String city = !cleanedCity.isBlank() ? cleanedCity : rawCity;

        return new String[]{city, state};
    }

    private PublicVehicleCardDto buildCategoryCard(
            String id,
            String title,
            String subtitle,
            String category,
            Double rating,
            Integer ratingCount,
            Integer seating,
            String image,
            int distanceKm,
            BigDecimal perKmRate,
            BigDecimal postLimitRate,
            List<String> fuelOptions,
            int availableCount,
            String badge,
            BigDecimal discountPercentage,
            boolean isRoundTrip,
            String modelName,
            String city,
            String state,
            String pickupTime,
            int tripDays
    ) {
        com.grabrentals.tariff.entity.PricingTaxConfig taxConfig = pricingTaxConfigService.getConfig();
        String gstType = (taxConfig.getGstType() != null && !taxConfig.getGstType().isBlank())
                ? taxConfig.getGstType().trim().toUpperCase() : "PERCENTAGE";
        BigDecimal gstPercent = taxConfig.getGstPercentage() != null ? taxConfig.getGstPercentage() : new BigDecimal("5.00");
        BigDecimal gstAmount = taxConfig.getGstAmount() != null ? taxConfig.getGstAmount() : BigDecimal.ZERO;

        BigDecimal standardBaseFare = perKmRate.multiply(BigDecimal.valueOf(distanceKm)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal originalBaseFare = standardBaseFare;
        BigDecimal baseFare = standardBaseFare;

        if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discRate = discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal discountAmt = standardBaseFare.multiply(discRate).setScale(0, RoundingMode.HALF_UP);
            baseFare = standardBaseFare.subtract(discountAmt);
        }

        // Dedicated Driver Allowance Rule lookup (Car model, City, State, Day/Night Shift)
        com.grabrentals.tariff.entity.DriverAllowance customAllowance = (driverAllowanceService != null)
                ? driverAllowanceService.resolveAllowance(modelName, city, state, pickupTime)
                : null;

        String driverType;
        BigDecimal driverPercent;
        BigDecimal driverAllowance;
        String driverInclusionLabel;

        int days = isRoundTrip ? Math.max(1, tripDays) : 1;
        BigDecimal daysBd = BigDecimal.valueOf(days);

        if (customAllowance != null) {
            driverType = (customAllowance.getAllowanceType() != null && !customAllowance.getAllowanceType().isBlank())
                    ? customAllowance.getAllowanceType().trim().toUpperCase() : "FLAT";
            if ("FLAT".equalsIgnoreCase(driverType)) {
                BigDecimal perDayAllowance = (customAllowance.getAllowanceValue() != null)
                        ? customAllowance.getAllowanceValue().setScale(0, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                driverAllowance = perDayAllowance.multiply(daysBd);
                driverPercent = BigDecimal.ZERO;
                driverInclusionLabel = days > 1
                        ? "Driver Allowance (₹" + perDayAllowance.toPlainString() + " × " + days + " Days)"
                        : "Driver Allowance (₹" + driverAllowance.toPlainString() + ")";
            } else {
                BigDecimal safePercent = customAllowance.getAllowanceValue() != null
                        ? customAllowance.getAllowanceValue()
                        : new BigDecimal("10.00");
                BigDecimal driverRate = safePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                driverAllowance = baseFare.multiply(driverRate).setScale(0, RoundingMode.HALF_UP);
                driverPercent = safePercent;
                driverInclusionLabel = "Driver Allowance (" + safePercent.stripTrailingZeros().toPlainString() + "%)";
            }
        } else {
            driverType = (taxConfig.getDriverAllowanceType() != null && !taxConfig.getDriverAllowanceType().isBlank())
                    ? taxConfig.getDriverAllowanceType().trim().toUpperCase() : "PERCENTAGE";
            driverPercent = taxConfig.getDriverAllowancePercentage() != null ? taxConfig.getDriverAllowancePercentage() : new BigDecimal("10.00");
            BigDecimal driverAmount = taxConfig.getDriverAllowanceAmount() != null ? taxConfig.getDriverAllowanceAmount() : BigDecimal.ZERO;

            if ("FLAT".equalsIgnoreCase(driverType)) {
                BigDecimal flatAmt = (driverAmount != null && driverAmount.compareTo(BigDecimal.ZERO) > 0)
                        ? driverAmount
                        : (driverPercent.compareTo(new BigDecimal("100")) > 0 ? driverPercent : new BigDecimal("400.00"));
                BigDecimal perDayAllowance = flatAmt.setScale(0, RoundingMode.HALF_UP);
                driverAllowance = perDayAllowance.multiply(daysBd);
                driverInclusionLabel = days > 1
                        ? "Driver Allowance (₹" + perDayAllowance.toPlainString() + " × " + days + " Days)"
                        : "Driver Allowance (₹" + driverAllowance.toPlainString() + ")";
            } else {
                BigDecimal safePercent = driverPercent.compareTo(new BigDecimal("100")) > 0 ? new BigDecimal("10.00") : driverPercent;
                BigDecimal driverRate = safePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                driverAllowance = baseFare.multiply(driverRate).setScale(0, RoundingMode.HALF_UP);
                driverInclusionLabel = "Driver Allowance (" + safePercent.stripTrailingZeros().toPlainString() + "%)";
            }
        }

        BigDecimal taxes;
        String gstInclusionLabel;
        if ("FLAT".equalsIgnoreCase(gstType)) {
            taxes = gstAmount.setScale(0, RoundingMode.HALF_UP);
            gstInclusionLabel = "GST (₹" + taxes.toPlainString() + ") & Government Passenger Cess";
        } else {
            BigDecimal safeGst = gstPercent.compareTo(new BigDecimal("100")) > 0 ? new BigDecimal("5.00") : gstPercent;
            BigDecimal gstRate = safeGst.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            taxes = baseFare.add(driverAllowance).multiply(gstRate).setScale(0, RoundingMode.HALF_UP);
            gstInclusionLabel = "GST (" + safeGst.stripTrailingZeros().toPlainString() + "%) & Government Passenger Cess";
        }

        BigDecimal discounted = baseFare.add(driverAllowance).add(taxes);
        BigDecimal original = originalBaseFare;
        BigDecimal advance = discounted.multiply(new BigDecimal("0.25")).setScale(0, RoundingMode.HALF_UP);

        return PublicVehicleCardDto.builder()
                .id(id)
                .title(title)
                .subtitle(subtitle)
                .category(category)
                .rating(rating)
                .ratingCount(ratingCount)
                .seating(seating)
                .image(image)
                .includedKms(distanceKm)
                .postLimitRate("₹" + postLimitRate + "/km")
                .pricing(PublicVehicleCardDto.PublicPricingDto.builder()
                        .originalPrice(original)
                        .discountedPrice(discounted)
                        .baseFare(baseFare)
                        .driverAllowance(driverAllowance)
                        .chargesAndTaxes(taxes)
                        .advanceAmount(advance)
                        .gstPercentage(gstPercent)
                        .driverAllowancePercentage(driverPercent)
                        .driverAllowanceType(driverType)
                        .driverAllowanceLabel(driverInclusionLabel)
                        .discountPercentage(discountPercentage != null ? discountPercentage : BigDecimal.ZERO)
                        .build())
                .fuelOptions(fuelOptions)
                .inclusions(isRoundTrip ? List.of(
                        "Base Fare and Fuel Charges for " + distanceKm + " km",
                        driverInclusionLabel,
                        gstInclusionLabel,
                        "Air Conditioning (AC)"
                ) : List.of(
                        "Base Fare and Fuel Charges for " + distanceKm + " km",
                        driverInclusionLabel,
                        gstInclusionLabel,
                        "State Tax & Toll Charges",
                        "Air Conditioning (AC)"
                ))
                .exclusions(isRoundTrip ? List.of(
                        "Tolls, State Entry Tax & Parking fees at actuals",
                        "Driver Night Allowance (Between 10:00 PM – 6:00 AM)",
                        "Pay ₹" + postLimitRate + "/km after " + distanceKm + " km",
                        "Multiple pickups and drops outside designated route"
                ) : List.of(
                        "Driver Night Allowance (Between 10:00 PM – 6:00 AM)",
                        "Pay ₹" + postLimitRate + "/km after " + distanceKm + " km",
                        "Multiple pickups and drops outside designated route"
                ))
                .availableCount(Math.max(availableCount, 1))
                .badge(badge)
                .build();
    }

    private String mapVehicleCategory(String vehicleType, Integer seatingCapacity) {
        if (vehicleType == null) vehicleType = "";
        String vt = vehicleType.toUpperCase();
        int seats = seatingCapacity != null ? seatingCapacity : 4;

        if (vt.contains("HATCHBACK")) return "HATCHBACK";
        if (vt.contains("SEDAN")) return "SEDAN";
        if (vt.contains("SUV")) {
            return seats >= 7 ? "SUV_7" : "SUV_6";
        }
        if (seats >= 7) return "SUV_7";
        if (seats >= 6) return "SUV_6";
        return "SEDAN";
    }

    public int calculateDistance(String from, String to, String tripType) {
        return calculateDistanceWithStops(from, to, Collections.emptyList(), tripType);
    }

    public int calculateDistanceWithStops(String from, String to, List<String> stops, String tripType) {
        boolean isRound = tripType != null && tripType.toLowerCase().contains("round");
        List<String> points = new ArrayList<>();
        points.add(from);
        if (stops != null) {
            for (String s : stops) {
                if (s != null && !s.isBlank()) points.add(s.trim());
            }
        }
        points.add(to);
        if (isRound) {
            points.add(from);
        }

        int totalKm = 0;
        for (int i = 0; i < points.size() - 1; i++) {
            totalKm += getSegmentDistance(points.get(i), points.get(i + 1));
        }
        return totalKm;
    }

    private static final Map<String, double[]> CITY_COORDS = new HashMap<>();

    static {
        // Karnataka
        CITY_COORDS.put("bangalore", new double[]{12.9716, 77.5946});
        CITY_COORDS.put("bengaluru", new double[]{12.9716, 77.5946});
        CITY_COORDS.put("mysore", new double[]{12.2958, 76.6394});
        CITY_COORDS.put("mysuru", new double[]{12.2958, 76.6394});
        CITY_COORDS.put("mangalore", new double[]{12.9141, 74.8560});
        CITY_COORDS.put("mangaluru", new double[]{12.9141, 74.8560});
        CITY_COORDS.put("coorg", new double[]{12.4244, 75.7382});
        CITY_COORDS.put("madikeri", new double[]{12.4244, 75.7382});
        CITY_COORDS.put("chikmagalur", new double[]{13.3161, 75.7720});
        CITY_COORDS.put("hubli", new double[]{15.3647, 75.1240});
        CITY_COORDS.put("belgaum", new double[]{15.8497, 74.4977});
        CITY_COORDS.put("hampi", new double[]{15.3350, 76.4600});
        CITY_COORDS.put("shimoga", new double[]{13.9299, 75.5681});
        CITY_COORDS.put("udupi", new double[]{13.3409, 74.7421});
        CITY_COORDS.put("gokarna", new double[]{14.5479, 74.3188});
        CITY_COORDS.put("hassan", new double[]{13.0033, 76.1004});

        // Tamil Nadu
        CITY_COORDS.put("coimbatore", new double[]{11.0168, 76.9558});
        CITY_COORDS.put("chennai", new double[]{13.0827, 80.2707});
        CITY_COORDS.put("madras", new double[]{13.0827, 80.2707});
        CITY_COORDS.put("ooty", new double[]{11.4102, 76.6950});
        CITY_COORDS.put("madurai", new double[]{9.9252, 78.1198});
        CITY_COORDS.put("salem", new double[]{11.6643, 78.1460});
        CITY_COORDS.put("trichy", new double[]{10.7905, 78.7047});
        CITY_COORDS.put("tiruchirappalli", new double[]{10.7905, 78.7047});
        CITY_COORDS.put("pondicherry", new double[]{11.9416, 79.8083});
        CITY_COORDS.put("puducherry", new double[]{11.9416, 79.8083});
        CITY_COORDS.put("kodaikanal", new double[]{10.2381, 77.4892});
        CITY_COORDS.put("tirupur", new double[]{11.1085, 77.3411});
        CITY_COORDS.put("erode", new double[]{11.3410, 77.7172});
        CITY_COORDS.put("vellore", new double[]{12.9165, 79.1325});
        CITY_COORDS.put("thanjavur", new double[]{10.7870, 79.1378});
        CITY_COORDS.put("tirunelveli", new double[]{8.7139, 77.7567});
        CITY_COORDS.put("rameswaram", new double[]{9.2876, 79.3129});
        CITY_COORDS.put("kanyakumari", new double[]{8.0883, 77.5385});
        CITY_COORDS.put("theni", new double[]{10.0104, 77.4768});
        CITY_COORDS.put("dindigul", new double[]{10.3673, 77.9803});
        CITY_COORDS.put("tiruvannamalai", new double[]{12.2253, 79.0747});
        CITY_COORDS.put("thiruvannamalai", new double[]{12.2253, 79.0747});
        CITY_COORDS.put("kumbakonam", new double[]{10.9602, 79.3845});
        CITY_COORDS.put("palani", new double[]{10.4500, 77.5200});
        CITY_COORDS.put("chidambaram", new double[]{11.3992, 79.6936});
        CITY_COORDS.put("velankanni", new double[]{10.6800, 79.8398});
        CITY_COORDS.put("karaikudi", new double[]{10.0735, 78.7732});
        CITY_COORDS.put("dharmapuri", new double[]{12.1211, 78.1582});
        CITY_COORDS.put("krishnagiri", new double[]{12.5186, 78.2137});
        CITY_COORDS.put("namakkal", new double[]{11.2189, 78.1674});
        CITY_COORDS.put("karur", new double[]{10.9601, 78.0766});
        CITY_COORDS.put("tenkasi", new double[]{8.9594, 77.3150});
        CITY_COORDS.put("kollur", new double[]{13.8653, 74.8115});
        CITY_COORDS.put("sringeri", new double[]{13.4189, 75.2570});
        CITY_COORDS.put("murudeshwar", new double[]{14.0940, 74.4899});
        CITY_COORDS.put("dharmasthala", new double[]{12.9567, 75.3789});
        CITY_COORDS.put("kukke", new double[]{12.6644, 75.6178});
        CITY_COORDS.put("subramanya", new double[]{12.6644, 75.6178});

        // Kerala
        CITY_COORDS.put("kochi", new double[]{9.9312, 76.2673});
        CITY_COORDS.put("cochin", new double[]{9.9312, 76.2673});
        CITY_COORDS.put("trivandrum", new double[]{8.5241, 76.9366});
        CITY_COORDS.put("thiruvananthapuram", new double[]{8.5241, 76.9366});
        CITY_COORDS.put("kozhikode", new double[]{11.2588, 75.7804});
        CITY_COORDS.put("calicut", new double[]{11.2588, 75.7804});
        CITY_COORDS.put("munnar", new double[]{10.0889, 77.0595});
        CITY_COORDS.put("wayanad", new double[]{11.6854, 76.1320});
        CITY_COORDS.put("alleppey", new double[]{9.4981, 76.3388});
        CITY_COORDS.put("alappuzha", new double[]{9.4981, 76.3388});
        CITY_COORDS.put("thrissur", new double[]{10.5276, 76.2144});

        // Andhra Pradesh & Telangana
        CITY_COORDS.put("hyderabad", new double[]{17.3850, 78.4867});
        CITY_COORDS.put("visakhapatnam", new double[]{17.6868, 83.2185});
        CITY_COORDS.put("vizag", new double[]{17.6868, 83.2185});
        CITY_COORDS.put("vijayawada", new double[]{16.5062, 80.6480});
        CITY_COORDS.put("tirupati", new double[]{13.6288, 79.4192});

        // Maharashtra & Goa
        CITY_COORDS.put("mumbai", new double[]{19.0760, 72.8777});
        CITY_COORDS.put("pune", new double[]{18.5204, 73.8567});
        CITY_COORDS.put("nagpur", new double[]{21.1458, 79.0882});
        CITY_COORDS.put("nashik", new double[]{19.9975, 73.7898});
        CITY_COORDS.put("shirdi", new double[]{19.7668, 74.4762});
        CITY_COORDS.put("mahabaleshwar", new double[]{17.9307, 73.6477});
        CITY_COORDS.put("lonavala", new double[]{18.7557, 73.4091});
        CITY_COORDS.put("goa", new double[]{15.2993, 74.1240});
        CITY_COORDS.put("panaji", new double[]{15.4909, 73.8278});

        // North & Other
        CITY_COORDS.put("delhi", new double[]{28.6139, 77.2090});
        CITY_COORDS.put("noida", new double[]{28.5355, 77.3910});
        CITY_COORDS.put("gurgaon", new double[]{28.4595, 77.0266});
        CITY_COORDS.put("gurugram", new double[]{28.4595, 77.0266});
        CITY_COORDS.put("jaipur", new double[]{26.9124, 75.7873});
        CITY_COORDS.put("agra", new double[]{27.1767, 78.0081});
        CITY_COORDS.put("chandigarh", new double[]{30.7333, 76.7794});
        CITY_COORDS.put("amritsar", new double[]{31.6340, 74.8723});
        CITY_COORDS.put("dehradun", new double[]{30.3165, 78.0322});
        CITY_COORDS.put("haridwar", new double[]{29.9457, 78.1642});
        CITY_COORDS.put("rishikesh", new double[]{30.0869, 78.2676});
        CITY_COORDS.put("shimla", new double[]{31.1048, 77.1734});
        CITY_COORDS.put("manali", new double[]{32.2432, 77.1892});
        CITY_COORDS.put("udaipur", new double[]{24.5854, 73.7125});
        CITY_COORDS.put("kolkata", new double[]{22.5726, 88.3639});
        CITY_COORDS.put("ahmedabad", new double[]{23.0225, 72.5714});
        CITY_COORDS.put("surat", new double[]{21.1702, 72.8311});
    }

    private int getSegmentDistance(String from, String to) {
        String f = (from != null ? from : "").toLowerCase();
        String t = (to != null ? to : "").toLowerCase();

        // Dynamic GPS Coordinate Haversine + road winding factor (1.28x)
        double[] c1 = lookupCoordinates(f);
        double[] c2 = lookupCoordinates(t);
        if (c1 != null && c2 != null) {
            double airKm = haversineKm(c1[0], c1[1], c2[0], c2[1]);
            int roadKm = (int) Math.round(airKm * 1.297);
            return Math.max(roadKm, 25);
        }

        return 0;
    }

    private double[] lookupCoordinates(String cityName) {
        if (cityName == null || cityName.isBlank()) return null;
        String lower = cityName.toLowerCase().replaceAll("\\(.*?\\)", "").trim();
        for (Map.Entry<String, double[]> entry : CITY_COORDS.entrySet()) {
            if (lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        String clean = lower.split(",")[0].trim();
        for (Map.Entry<String, double[]> entry : CITY_COORDS.entrySet()) {
            if (clean.contains(entry.getKey()) || entry.getKey().contains(clean)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }

    private boolean matchesPair(String a, String b, String city1, String city2) {
        return (a.contains(city1) && b.contains(city2)) || (a.contains(city2) && b.contains(city1));
    }

    private BigDecimal getDefaultRateForType(String vehicleType, Integer seatingCapacity) {
        String category = mapVehicleCategory(vehicleType, seatingCapacity);
        switch (category) {
            case "HATCHBACK":
                return new BigDecimal("11.70");
            case "SUV_6":
                return new BigDecimal("15.60");
            case "SUV_7":
                return new BigDecimal("19.50");
            case "SEDAN":
            default:
                return new BigDecimal("12.00");
        }
    }

    private String resolveVehicleImage(String model, String category, String customImageUrl) {
        String m = model != null ? model.toLowerCase() : "";

        // Prioritize official verified studio taxi renders for known models
        if (m.contains("innova") || m.contains("crysta") || m.contains("hycross") || m.contains("fortuner")) {
            return "/images/cars/innova.jpg";
        }
        if (m.contains("s-presso") || m.contains("spresso")) {
            return "/images/cars/spresso-clean.jpg";
        }
        if (m.contains("wagon") || m.contains("celerio") || m.contains("tiago") || m.contains("alto") || m.contains("kwid")) {
            return "/images/cars/wagon_r.jpg";
        }
        if (m.contains("ertiga") || m.contains("carens") || m.contains("triber") || m.contains("rumion") || m.contains("marazzo")) {
            return "/images/cars/ertiga.jpg";
        }
        if (m.contains("dzire") || m.contains("etios") || m.contains("amaze") || m.contains("verna") || m.contains("city") || m.contains("aura") || m.contains("tigor")) {
            return "/images/cars/dzire.jpg";
        }

        // If custom image is provided and not a dummy/broken link
        if (customImageUrl != null && !customImageUrl.isBlank() && !customImageUrl.contains("unsplash.com") && !customImageUrl.contains("localhost")) {
            return customImageUrl;
        }

        switch (category) {
            case "HATCHBACK":
                return "/images/cars/wagon_r.jpg";
            case "SUV_6":
                return "/images/cars/ertiga.jpg";
            case "SUV_7":
                return "/images/cars/innova.jpg";
            case "SEDAN":
            default:
                return "/images/cars/dzire.jpg";
        }
    }

    private String getVehicleBadge(String model, String category) {
        String m = model != null ? model.toLowerCase() : "";
        if (m.contains("wagon")) return "Most Economical";
        if (m.contains("dzire")) return "Customer Choice";
        if (m.contains("ertiga")) return "Family Favorite";
        if (m.contains("innova")) return "Premium Comfort";
        if (category.equals("SUV_7")) return "Executive SUV";
        if (category.equals("SUV_6")) return "Spacious Family";
        return "Verified Fleet";
    }

    private double getVehicleRating(String model, String category) {
        String m = model != null ? model.toLowerCase() : "";
        if (m.contains("wagon")) return 4.84;
        if (m.contains("dzire")) return 4.88;
        if (m.contains("ertiga")) return 4.81;
        if (m.contains("innova")) return 4.92;
        return 4.85;
    }
}

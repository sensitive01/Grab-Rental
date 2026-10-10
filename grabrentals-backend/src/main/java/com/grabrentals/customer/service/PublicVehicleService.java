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
    private final com.grabrentals.tariff.service.VehicleTariffService vehicleTariffService;

    public BookingResponse getBookingByReference(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingReference));
        return BookingResponse.fromEntity(booking);
    }

    public VehicleSearchResponseDto searchVehicles(String from, String to, String tripType, String pickupDate, String pickupTime) {
        return searchVehicles(from, to, null, tripType, pickupDate, pickupTime);
    }

    /**
     * Search available vehicles for an outstation route with real pricing calculations.
     */
    public VehicleSearchResponseDto searchVehicles(String from, String to, String stops, String tripType, String pickupDate, String pickupTime) {
        String cleanFrom = (from != null && !from.isBlank()) ? from.trim() : "Bangalore";
        String cleanTo = (to != null && !to.isBlank()) ? to.trim() : "Coimbatore";
        String normalizedTripType = (tripType != null && tripType.toLowerCase().contains("round")) ? "Round trip" : "One way";

        List<String> parsedStops = new ArrayList<>();
        if (stops != null && !stops.isBlank()) {
            String[] parts = stops.split("[|,]");
            for (String p : parts) {
                if (p != null && !p.trim().isBlank()) {
                    parsedStops.add(p.trim());
                }
            }
        }

        int distanceKm = calculateDistanceWithStops(cleanFrom, cleanTo, parsedStops, normalizedTripType);

        // Priority 1: Use active Vehicle Models configured by Admin in the catalog
        List<VehicleModelConfigResponse> activeConfigs = vehicleTariffService.getActiveModelConfigs();

        List<PublicVehicleCardDto> cards = new ArrayList<>();

        if (activeConfigs != null && !activeConfigs.isEmpty()) {
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

                // Dynamically resolve rate using Tariff Engine (checks seasonal, weekday/weekend, day/night)
                Map<String, Object> rateContext = vehicleTariffService.calculateRate(
                        config.getCategory(), model, String.valueOf(seats), pickupDate, pickupTime
                );
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

                PublicVehicleCardDto card = buildCategoryCard(
                        cardId,
                        model + " or Equivalent",
                        typeTitle + " • AC • " + seats + " Seats",
                        category,
                        rating,
                        ratingCount,
                        seats,
                        image,
                        distanceKm,
                        rate,
                        postRate,
                        List.of(fuel),
                        5,
                        badge
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

                cards.add(card);
            }
        } else {
            // Fallback if no admin vehicle models are configured yet
            List<Vehicle> availableVehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE);

            if (availableVehicles.isEmpty()) {
                cards.add(buildCategoryCard("hatchback", "Wagon R or Equivalent", "Hatchback • AC • 4 Seats", "HATCHBACK",
                        4.84, 1420, 4, vehicleTariffService.resolveCommonPhoto("Hatchback", "WagonR", "4"), distanceKm, new BigDecimal("11.70"), new BigDecimal("12.50"),
                        List.of("CNG", "Diesel"), 4, "Most Economical"));
                cards.add(buildCategoryCard("sedan", "Maruti Dzire or Equivalent", "Sedan • AC • 4 Seats", "SEDAN",
                        4.88, 2840, 4, vehicleTariffService.resolveCommonPhoto("Sedan", "Dzire", "4"), distanceKm, new BigDecimal("12.00"), new BigDecimal("13.00"),
                        List.of("CNG", "Diesel"), 7, "Customer Choice"));
                cards.add(buildCategoryCard("suv_6", "Maruti Ertiga or Equivalent", "SUV • AC • 6 Seats", "SUV_6",
                        4.81, 980, 6, vehicleTariffService.resolveCommonPhoto("SUV", "Ertiga", "6"), distanceKm, new BigDecimal("15.60"), new BigDecimal("16.50"),
                        List.of("CNG", "Diesel"), 3, "Family Favorite"));
                cards.add(buildCategoryCard("suv_7", "Toyota Innova Crysta or Equivalent", "Executive SUV • AC • 7 Seats", "SUV_7",
                        4.92, 1650, 7, vehicleTariffService.resolveCommonPhoto("Innovacrysta", "Innova Crysta", "7"), distanceKm, new BigDecimal("19.50"), new BigDecimal("21.00"),
                        List.of("Diesel"), 5, "Premium Comfort"));
            } else {
                for (Vehicle v : availableVehicles) {
                    String model = (v.getModel() != null && !v.getModel().isBlank()) ? v.getModel().trim() : "Standard Fleet";
                    int seats = v.getSeatingCapacity() != null ? v.getSeatingCapacity() : 4;

                    Map<String, Object> rateContext = vehicleTariffService.calculateRate(
                            v.getVehicleType(), model, String.valueOf(seats), pickupDate, pickupTime
                    );
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
                    String loc = v.getParkingLocation() != null && !v.getParkingLocation().isBlank()
                            ? v.getParkingLocation()
                            : (v.getCurrentLocation() != null && !v.getCurrentLocation().isBlank() ? v.getCurrentLocation() : cleanFrom);
                    String chauffeurName = (v.getUser() != null && v.getUser().getName() != null && !v.getUser().getName().isBlank())
                            ? v.getUser().getName()
                            : "Verified Commercial Chauffeur";

                    PublicVehicleCardDto card = buildCategoryCard(
                            cardId,
                            model,
                            typeTitle + " • AC • " + seats + " Seats",
                            category,
                            rating,
                            ratingCount,
                            seats,
                            image,
                            distanceKm,
                            rate,
                            postRate,
                            List.of(fuel),
                            1,
                            badge
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

                    cards.add(card);
                }
            }
        }

        return VehicleSearchResponseDto.builder()
                .from(cleanFrom)
                .to(cleanTo)
                .stops(parsedStops.isEmpty() ? null : parsedStops)
                .tripType(normalizedTripType)
                .distanceKm(distanceKm)
                .pickupDate(pickupDate)
                .pickupTime(pickupTime)
                .vehicles(cards)
                .build();
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
            String badge
    ) {
        BigDecimal discounted = perKmRate.multiply(BigDecimal.valueOf(distanceKm)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal original = discounted.multiply(new BigDecimal("1.14")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxes = BigDecimal.ZERO; // GST set to 0 for now
        BigDecimal advance = discounted.multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);

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
                        .chargesAndTaxes(taxes)
                        .advanceAmount(advance)
                        .build())
                .fuelOptions(fuelOptions)
                .inclusions(List.of(
                        "Base Fare and Fuel Charges for " + distanceKm + " km",
                        "Driver Allowance & Night Driving Included",
                        "GST & Government Passenger Cess"
                ))
                .exclusions(List.of(
                        "Pay " + ("₹" + postLimitRate + "/km") + " after " + distanceKm + " km",
                        "State Entry Tax, Toll Charges & Parking fees at actuals"
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

    private int calculateDistance(String from, String to, String tripType) {
        return calculateDistanceWithStops(from, to, Collections.emptyList(), tripType);
    }

    private int calculateDistanceWithStops(String from, String to, List<String> stops, String tripType) {
        int oneWay;
        if (stops == null || stops.isEmpty()) {
            oneWay = getSegmentDistance(from, to);
            if (oneWay == 180) oneWay = 320; // Default outstation distance if unrecognized route
        } else {
            List<String> points = new ArrayList<>();
            points.add(from);
            points.addAll(stops);
            points.add(to);

            oneWay = 0;
            for (int i = 0; i < points.size() - 1; i++) {
                oneWay += getSegmentDistance(points.get(i), points.get(i + 1));
            }
        }

        boolean isRound = tripType != null && tripType.toLowerCase().contains("round");
        return isRound ? oneWay * 2 : oneWay;
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
        CITY_COORDS.put("hosur", new double[]{12.7409, 77.8253});

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

        // 1. Explicit highway overrides
        if (matchesPair(f, t, "bangalore", "coimbatore") || matchesPair(f, t, "bengaluru", "coimbatore")) return 365;
        if (matchesPair(f, t, "bangalore", "chennai") || matchesPair(f, t, "bengaluru", "chennai")) return 347;
        if (matchesPair(f, t, "bangalore", "mysore") || matchesPair(f, t, "bengaluru", "mysore")) return 145;
        if (matchesPair(f, t, "bangalore", "hyderabad") || matchesPair(f, t, "bengaluru", "hyderabad")) return 575;
        if (matchesPair(f, t, "bangalore", "ooty") || matchesPair(f, t, "bengaluru", "ooty")) return 275;
        if (matchesPair(f, t, "bangalore", "pondicherry") || matchesPair(f, t, "bengaluru", "pondicherry")) return 315;
        if (matchesPair(f, t, "bangalore", "salem") || matchesPair(f, t, "bengaluru", "salem")) return 200;
        if (matchesPair(f, t, "bangalore", "madurai") || matchesPair(f, t, "bengaluru", "madurai")) return 435;
        if (matchesPair(f, t, "bangalore", "trichy") || matchesPair(f, t, "bengaluru", "trichy")) return 330;
        if (matchesPair(f, t, "bangalore", "kochi") || matchesPair(f, t, "bengaluru", "kochi")) return 540;
        if (matchesPair(f, t, "salem", "coimbatore")) return 165;
        if (matchesPair(f, t, "salem", "madurai")) return 235;
        if (matchesPair(f, t, "mysore", "ooty")) return 125;
        if (matchesPair(f, t, "coimbatore", "ooty")) return 85;
        if (matchesPair(f, t, "chennai", "coimbatore")) return 505;
        if (matchesPair(f, t, "chennai", "madurai")) return 460;
        if (matchesPair(f, t, "chennai", "pondicherry")) return 150;
        if (matchesPair(f, t, "chennai", "salem")) return 340;
        if (matchesPair(f, t, "mumbai", "pune")) return 155;
        if (matchesPair(f, t, "mumbai", "nashik")) return 165;
        if (matchesPair(f, t, "delhi", "jaipur")) return 280;
        if (matchesPair(f, t, "delhi", "agra")) return 235;
        if (matchesPair(f, t, "agra", "jaipur")) return 240;
        if (matchesPair(f, t, "kochi", "trivandrum")) return 205;

        // 2. Automatic GPS Coordinate Haversine + road winding factor (1.28x)
        double[] c1 = lookupCoordinates(f);
        double[] c2 = lookupCoordinates(t);
        if (c1 != null && c2 != null) {
            double airKm = haversineKm(c1[0], c1[1], c2[0], c2[1]);
            int roadKm = (int) Math.round(airKm * 1.28);
            return Math.max(roadKm, 40);
        }

        return 220;
    }

    private double[] lookupCoordinates(String cityName) {
        if (cityName == null || cityName.isBlank()) return null;
        String clean = cityName.toLowerCase().split(",")[0].replaceAll("\\(.*?\\)", "").trim();
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
            return "/images/cars/spresso.jpg";
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

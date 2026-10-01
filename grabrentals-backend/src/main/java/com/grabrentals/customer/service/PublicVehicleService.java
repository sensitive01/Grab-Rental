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

        // Fetch live available vehicles from database
        List<Vehicle> availableVehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE);

        List<PublicVehicleCardDto> cards = new ArrayList<>();

        if (availableVehicles.isEmpty()) {
            // Fallback cards if no vehicles registered in database yet
            cards.add(buildCategoryCard("hatchback", "Wagon R or Equivalent", "Hatchback • AC • 4 Seats", "HATCHBACK",
                    4.84, 1420, 4, "/images/cars/wagon_r.jpg", distanceKm, new BigDecimal("11.70"), new BigDecimal("12.50"),
                    List.of("CNG", "Diesel"), 4, "Most Economical"));
            cards.add(buildCategoryCard("sedan", "Maruti Dzire or Equivalent", "Sedan • AC • 4 Seats", "SEDAN",
                    4.88, 2840, 4, "/images/cars/dzire.jpg", distanceKm, new BigDecimal("12.00"), new BigDecimal("13.00"),
                    List.of("CNG", "Diesel"), 7, "Customer Choice"));
            cards.add(buildCategoryCard("suv_6", "Maruti Ertiga or Equivalent", "SUV • AC • 6 Seats", "SUV_6",
                    4.81, 980, 6, "/images/cars/ertiga.jpg", distanceKm, new BigDecimal("15.60"), new BigDecimal("16.50"),
                    List.of("CNG", "Diesel"), 3, "Family Favorite"));
            cards.add(buildCategoryCard("suv_7", "Toyota Innova Crysta or Equivalent", "Executive SUV • AC • 7 Seats", "SUV_7",
                    4.92, 1650, 7, "/images/cars/innova.jpg", distanceKm, new BigDecimal("19.50"), new BigDecimal("21.00"),
                    List.of("Diesel"), 5, "Premium Comfort"));
        } else {
            // Dynamically group database vehicles by model name
            Map<String, List<Vehicle>> groupedByModel = new LinkedHashMap<>();
            for (Vehicle v : availableVehicles) {
                String modelName = (v.getModel() != null && !v.getModel().isBlank()) ? v.getModel().trim() : "Standard Fleet";
                groupedByModel.computeIfAbsent(modelName, k -> new ArrayList<>()).add(v);
            }

            for (Map.Entry<String, List<Vehicle>> entry : groupedByModel.entrySet()) {
                String model = entry.getKey();
                List<Vehicle> fleetList = entry.getValue();
                Vehicle rep = fleetList.get(0);

                // Collect distinct fuel options across this model's vehicles in database
                Set<String> fuelSet = new LinkedHashSet<>();
                for (Vehicle v : fleetList) {
                    if (v.getFuelType() != null && !v.getFuelType().isBlank()) {
                        fuelSet.add(v.getFuelType().toUpperCase());
                    }
                }
                if (fuelSet.isEmpty()) {
                    fuelSet.add("Diesel");
                }

                // Dynamic pricing from database vehicle configuration
                BigDecimal rate = (rep.getPerKmRate() != null && rep.getPerKmRate().compareTo(BigDecimal.ZERO) > 0)
                        ? rep.getPerKmRate()
                        : getDefaultRateForType(rep.getVehicleType(), rep.getSeatingCapacity());
                BigDecimal postRate = rate.add(new BigDecimal("1.00"));

                int seats = rep.getSeatingCapacity() != null ? rep.getSeatingCapacity() : 4;
                String category = mapVehicleCategory(rep.getVehicleType(), seats);
                String typeTitle = (rep.getVehicleType() != null && !rep.getVehicleType().isBlank())
                        ? rep.getVehicleType()
                        : (category.contains("SUV") ? "SUV" : category.contains("SEDAN") ? "Sedan" : "Hatchback");

                String title = model.toLowerCase().contains("equivalent") ? model : model + " or Equivalent";
                String subtitle = typeTitle + " • AC • " + seats + " Seats";
                String image = resolveVehicleImage(model, category, rep.getImageUrl());
                String badge = getVehicleBadge(model, category);
                double rating = getVehicleRating(model, category);
                int ratingCount = 500 + (fleetList.size() * 120);
                String cardId = model.toLowerCase().replaceAll("[^a-z0-9]+", "_");

                cards.add(buildCategoryCard(
                        cardId,
                        title,
                        subtitle,
                        category,
                        rating,
                        ratingCount,
                        seats,
                        image,
                        distanceKm,
                        rate,
                        postRate,
                        new ArrayList<>(fuelSet),
                        fleetList.size(),
                        badge
                ));
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
        BigDecimal taxes = discounted.multiply(new BigDecimal("0.36")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal advance = (discounted.add(taxes)).multiply(new BigDecimal("0.20")).setScale(0, RoundingMode.HALF_UP);

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

    private int getSegmentDistance(String from, String to) {
        String f = (from != null ? from : "").toLowerCase();
        String t = (to != null ? to : "").toLowerCase();

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

        return 180;
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

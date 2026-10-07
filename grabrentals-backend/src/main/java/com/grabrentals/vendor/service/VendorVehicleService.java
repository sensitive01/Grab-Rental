package com.grabrentals.vendor.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.vendor.dto.CreateVehicleRequest;
import com.grabrentals.vendor.dto.VehicleResponse;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.VendorProfile;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VendorProfileRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorVehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public VehicleResponse registerVehicle(UUID vendorUserId, CreateVehicleRequest request) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + vendorUserId));

        String rawPlate = request.getVehicleNumber() != null ? request.getVehicleNumber().trim() : "";
        if (rawPlate.isBlank()) {
            throw new IllegalArgumentException("Vehicle plate number is required");
        }
        String normalizedPlate = rawPlate.replaceAll("\\s+", " ").toUpperCase();
        String compactPlate = rawPlate.replaceAll("[\\s-]+", "").toUpperCase();

        Optional<Vehicle> existingOpt = vehicleRepository.findByNormalizedVehicleNumber(compactPlate);
        if (existingOpt.isPresent()) {
            Vehicle existing = existingOpt.get();
            if (existing.getUser() != null && existing.getUser().getId().equals(vendorUserId)) {
                throw new IllegalArgumentException("Vehicle with plate number '" + normalizedPlate + "' is already registered in your fleet roster. Duplicate vehicle entries are not allowed.");
            } else {
                throw new IllegalArgumentException("Vehicle with plate number '" + normalizedPlate + "' is already registered on Grab Rentals by another fleet partner. Duplicate vehicle registrations across vendors are strictly prohibited.");
            }
        }

        String resolvedModel = (request.getVehicleModel() != null && !request.getVehicleModel().isBlank())
                ? request.getVehicleModel().trim()
                : "Commercial Fleet Asset";
        Integer capacity = (request.getSeatingCapacity() != null && request.getSeatingCapacity() > 0)
                ? request.getSeatingCapacity()
                : 5;
        String fuel = (request.getFuelType() != null && !request.getFuelType().isBlank())
                ? request.getFuelType().trim()
                : "Diesel";
        BigDecimal daily = (request.getDailyRate() != null && request.getDailyRate().compareTo(BigDecimal.ZERO) > 0)
                ? request.getDailyRate()
                : BigDecimal.valueOf(2500.0);
        BigDecimal perKm = (request.getPerKmRate() != null && request.getPerKmRate().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getPerKmRate()
                : BigDecimal.valueOf(14.0);

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .vehicleType(request.getVehicleType().trim())
                .model(resolvedModel)
                .vehicleNumber(normalizedPlate)
                .registrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim().toUpperCase() : null)
                .seatingCapacity(capacity)
                .fuelType(fuel)
                .acType(request.getAcType() != null ? request.getAcType().trim() : null)
                .variant(request.getVariant() != null ? request.getVariant().trim() : null)
                .color(request.getColor() != null ? request.getColor().trim() : null)
                .registrationType(request.getRegistrationType() != null ? request.getRegistrationType().trim() : null)
                .alternateFuel(request.getAlternateFuel() != null ? request.getAlternateFuel().trim() : null)
                .transmission(request.getTransmission() != null ? request.getTransmission().trim() : null)
                .engineCc(request.getEngineCc())
                .parkingLocation(request.getParkingLocation() != null ? request.getParkingLocation().trim() : null)
                .features(request.getFeatures() != null ? request.getFeatures().trim() : null)
                .year(request.getYear())
                .insuranceExpiry(request.getInsuranceExpiry())
                .permitExpiry(request.getPermitExpiry())
                .fitnessExpiry(request.getFitnessExpiry())
                .dailyRate(daily)
                .perKmRate(perKm)
                .currentLocation(request.getCurrentLocation() != null ? request.getCurrentLocation().trim() : null)
                .status(VehicleStatus.AVAILABLE)
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() 
                        ? request.getImageUrl().trim() 
                        : (request.getPhotos() != null && !request.getPhotos().isBlank() ? request.getPhotos().split(",")[0].trim() : null))
                .photos(request.getPhotos() != null ? request.getPhotos().trim() : null)
                .rcDocumentUrl(request.getRcDocumentUrl())
                .insuranceDocumentUrl(request.getInsuranceDocumentUrl())
                .permitDocumentUrl(request.getPermitDocumentUrl())
                .fitnessDocumentUrl(request.getFitnessDocumentUrl())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("[FLEET] Registered new vehicle {} (Plate: {}) for vendor {}", saved.getId(), saved.getVehicleNumber(), user.getEmail());

        // Update fleet size in vendor profile if exists
        Optional<VendorProfile> profileOpt = vendorProfileRepository.findByUserId(vendorUserId);
        profileOpt.ifPresent(profile -> {
            long currentCount = vehicleRepository.countByUserId(vendorUserId);
            profile.setFleetSize((int) currentCount);
            vendorProfileRepository.save(profile);
        });

        // Audit log event
        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("FLEET")
                    .event("VEHICLE_REGISTERED")
                    .userId(user.getId().toString())
                    .userName(user.getName())
                    .userRole(user.getRole().name())
                    .module("FLEET_MANAGEMENT")
                    .targetEntity("Vehicle: " + saved.getVehicleNumber())
                    .details("Added " + saved.getModel() + " (" + saved.getVehicleType() + ") with plate " + saved.getVehicleNumber())
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("[FLEET] Failed to log audit event for vehicle registration: {}", ex.getMessage());
        }

        return VehicleResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVendorVehicles(UUID vendorUserId) {
        List<Vehicle> vehicles = vehicleRepository.findByUserIdOrderByCreatedAtDesc(vendorUserId);

        List<Driver> assignedDrivers = driverRepository.findByUserIdAndAssignedVehicleIsNotNull(vendorUserId);
        Map<UUID, Driver> driverByVehicleId = new HashMap<>();
        for (Driver d : assignedDrivers) {
            if (d.getAssignedVehicle() != null) {
                driverByVehicleId.put(d.getAssignedVehicle().getId(), d);
            }
        }

        return vehicles.stream()
                .map(v -> VehicleResponse.fromEntity(v, driverByVehicleId.get(v.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(UUID vendorUserId, UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found or you do not have permission to view it"));
        Driver driver = driverRepository.findByAssignedVehicleId(vehicleId).orElse(null);
        return VehicleResponse.fromEntity(vehicle, driver);
    }

    @Transactional
    public VehicleResponse updateVehicle(UUID vendorUserId, UUID vehicleId, CreateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found or you do not have permission to edit it"));

        String rawPlate = request.getVehicleNumber() != null ? request.getVehicleNumber().trim() : "";
        if (rawPlate.isBlank()) {
            throw new IllegalArgumentException("Vehicle plate number is required");
        }
        String normalizedPlate = rawPlate.replaceAll("\\s+", " ").toUpperCase();
        String compactPlate = rawPlate.replaceAll("[\\s-]+", "").toUpperCase();

        Optional<Vehicle> duplicateOpt = vehicleRepository.findByNormalizedVehicleNumber(compactPlate);
        if (duplicateOpt.isPresent() && !duplicateOpt.get().getId().equals(vehicleId)) {
            Vehicle other = duplicateOpt.get();
            if (other.getUser() != null && other.getUser().getId().equals(vendorUserId)) {
                throw new IllegalArgumentException("Vehicle with plate number '" + normalizedPlate + "' is already registered to another vehicle in your fleet roster.");
            } else {
                throw new IllegalArgumentException("Vehicle with plate number '" + normalizedPlate + "' is already registered on Grab Rentals by another fleet partner. Duplicate vehicle registrations across vendors are strictly prohibited.");
            }
        }

        vehicle.setVehicleType(request.getVehicleType().trim());
        vehicle.setModel(request.getVehicleModel().trim());
        vehicle.setVehicleNumber(normalizedPlate);
        if (request.getRegistrationNumber() != null) {
            vehicle.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        }
        vehicle.setSeatingCapacity(request.getSeatingCapacity());
        if (request.getFuelType() != null) vehicle.setFuelType(request.getFuelType().trim());
        if (request.getAcType() != null) vehicle.setAcType(request.getAcType().trim());
        if (request.getVariant() != null) vehicle.setVariant(request.getVariant().trim());
        if (request.getColor() != null) vehicle.setColor(request.getColor().trim());
        if (request.getRegistrationType() != null) vehicle.setRegistrationType(request.getRegistrationType().trim());
        if (request.getAlternateFuel() != null) vehicle.setAlternateFuel(request.getAlternateFuel().trim());
        if (request.getTransmission() != null) vehicle.setTransmission(request.getTransmission().trim());
        if (request.getEngineCc() != null) vehicle.setEngineCc(request.getEngineCc());
        if (request.getParkingLocation() != null) vehicle.setParkingLocation(request.getParkingLocation().trim());
        if (request.getFeatures() != null) vehicle.setFeatures(request.getFeatures().trim());
        vehicle.setYear(request.getYear());
        vehicle.setInsuranceExpiry(request.getInsuranceExpiry());
        vehicle.setPermitExpiry(request.getPermitExpiry());
        vehicle.setFitnessExpiry(request.getFitnessExpiry());
        vehicle.setDailyRate(request.getDailyRate());
        vehicle.setPerKmRate(request.getPerKmRate());
        if (request.getCurrentLocation() != null) vehicle.setCurrentLocation(request.getCurrentLocation().trim());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) vehicle.setImageUrl(request.getImageUrl().trim());
        if (request.getRcDocumentUrl() != null && !request.getRcDocumentUrl().isBlank()) vehicle.setRcDocumentUrl(request.getRcDocumentUrl().trim());
        if (request.getInsuranceDocumentUrl() != null && !request.getInsuranceDocumentUrl().isBlank()) vehicle.setInsuranceDocumentUrl(request.getInsuranceDocumentUrl().trim());
        if (request.getPermitDocumentUrl() != null && !request.getPermitDocumentUrl().isBlank()) vehicle.setPermitDocumentUrl(request.getPermitDocumentUrl().trim());
        if (request.getFitnessDocumentUrl() != null && !request.getFitnessDocumentUrl().isBlank()) vehicle.setFitnessDocumentUrl(request.getFitnessDocumentUrl().trim());

        Vehicle saved = vehicleRepository.save(vehicle);
        Driver driver = driverRepository.findByAssignedVehicleId(vehicleId).orElse(null);
        return VehicleResponse.fromEntity(saved, driver);
    }

    @Transactional
    public VehicleResponse updateVehicleStatus(UUID vendorUserId, UUID vehicleId, VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found or you do not have permission to edit it"));
        vehicle.setStatus(status);
        Vehicle saved = vehicleRepository.save(vehicle);
        Driver driver = driverRepository.findByAssignedVehicleId(vehicleId).orElse(null);
        return VehicleResponse.fromEntity(saved, driver);
    }

    @Transactional
    public void deleteVehicle(UUID vendorUserId, UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found or you do not have permission to delete it"));

        vehicleRepository.delete(vehicle);
        log.info("[FLEET] Deleted vehicle {} (Plate: {}) for vendor {}", vehicle.getId(), vehicle.getVehicleNumber(), vendorUserId);

        Optional<VendorProfile> profileOpt = vendorProfileRepository.findByUserId(vendorUserId);
        profileOpt.ifPresent(profile -> {
            long currentCount = vehicleRepository.countByUserId(vendorUserId);
            profile.setFleetSize((int) currentCount);
            vendorProfileRepository.save(profile);
        });
    }
}

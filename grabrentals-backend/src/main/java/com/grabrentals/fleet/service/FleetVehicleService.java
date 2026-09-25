package com.grabrentals.fleet.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.fleet.dto.CreateVehicleRequest;
import com.grabrentals.fleet.dto.VehicleResponse;
import com.grabrentals.fleet.entity.Driver;
import com.grabrentals.fleet.entity.FleetProfile;
import com.grabrentals.fleet.entity.Vehicle;
import com.grabrentals.fleet.entity.VehicleStatus;
import com.grabrentals.fleet.repository.DriverRepository;
import com.grabrentals.fleet.repository.FleetProfileRepository;
import com.grabrentals.fleet.repository.VehicleRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FleetVehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final FleetProfileRepository fleetProfileRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public VehicleResponse registerVehicle(UUID vendorUserId, CreateVehicleRequest request) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + vendorUserId));

        String normalizedPlate = request.getVehicleNumber().trim().toUpperCase();

        if (vehicleRepository.existsByVehicleNumberIgnoreCase(normalizedPlate)) {
            throw new IllegalArgumentException("Vehicle plate number '" + normalizedPlate + "' is already registered in the platform");
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .vehicleType(request.getVehicleType().trim())
                .model(request.getVehicleModel().trim())
                .vehicleNumber(normalizedPlate)
                .registrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim().toUpperCase() : null)
                .seatingCapacity(request.getSeatingCapacity())
                .fuelType(request.getFuelType() != null ? request.getFuelType().trim() : null)
                .acType(request.getAcType() != null ? request.getAcType().trim() : null)
                .year(request.getYear())
                .insuranceExpiry(request.getInsuranceExpiry())
                .permitExpiry(request.getPermitExpiry())
                .fitnessExpiry(request.getFitnessExpiry())
                .dailyRate(request.getDailyRate())
                .perKmRate(request.getPerKmRate())
                .currentLocation(request.getCurrentLocation() != null ? request.getCurrentLocation().trim() : null)
                .status(VehicleStatus.AVAILABLE)
                .imageUrl(request.getImageUrl())
                .rcDocumentUrl(request.getRcDocumentUrl())
                .insuranceDocumentUrl(request.getInsuranceDocumentUrl())
                .permitDocumentUrl(request.getPermitDocumentUrl())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("[FLEET] Registered new vehicle {} (Plate: {}) for vendor {}", saved.getId(), saved.getVehicleNumber(), user.getEmail());

        // Update fleet size in vendor profile if exists
        Optional<FleetProfile> profileOpt = fleetProfileRepository.findByUserId(vendorUserId);
        profileOpt.ifPresent(profile -> {
            long currentCount = vehicleRepository.countByUserId(vendorUserId);
            profile.setFleetSize((int) currentCount);
            fleetProfileRepository.save(profile);
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
    public void deleteVehicle(UUID vendorUserId, UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found or you do not have permission to delete it"));

        vehicleRepository.delete(vehicle);
        log.info("[FLEET] Deleted vehicle {} (Plate: {}) for vendor {}", vehicle.getId(), vehicle.getVehicleNumber(), vendorUserId);

        Optional<FleetProfile> profileOpt = fleetProfileRepository.findByUserId(vendorUserId);
        profileOpt.ifPresent(profile -> {
            long currentCount = vehicleRepository.countByUserId(vendorUserId);
            profile.setFleetSize((int) currentCount);
            fleetProfileRepository.save(profile);
        });
    }
}

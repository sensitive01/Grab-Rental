package com.grabrentals.fleet.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.fleet.dto.CreateDriverRequest;
import com.grabrentals.fleet.dto.DriverResponse;
import com.grabrentals.fleet.dto.UpdateDriverRequest;
import com.grabrentals.fleet.entity.Driver;
import com.grabrentals.fleet.entity.DriverStatus;
import com.grabrentals.fleet.entity.Vehicle;
import com.grabrentals.fleet.repository.DriverRepository;
import com.grabrentals.fleet.repository.VehicleRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FleetDriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public DriverResponse registerDriver(UUID vendorUserId, CreateDriverRequest request) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + vendorUserId));

        String normalizedLicense = request.getLicenseNumber().trim().toUpperCase();

        if (driverRepository.existsByLicenseNumberIgnoreCase(normalizedLicense)) {
            throw new IllegalArgumentException("Driver with commercial license '" + normalizedLicense + "' is already registered in the platform");
        }

        Vehicle assignedVehicle = null;
        if (request.getAssignedVehicleId() != null) {
            assignedVehicle = vehicleRepository.findByIdAndUserId(request.getAssignedVehicleId(), vendorUserId)
                    .orElse(null);
        }

        Driver driver = Driver.builder()
                .user(user)
                .name(request.getName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .address(request.getAddress().trim())
                .dob(request.getDob())
                .bloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null)
                .emergencyContact(request.getEmergencyContact().trim())
                .licenseNumber(normalizedLicense)
                .licenseExpiry(request.getLicenseExpiry())
                .experienceYears(request.getExperienceYears())
                .assignedVehicle(assignedVehicle)
                .licenseDocumentUrl(request.getLicenseDocumentUrl())
                .photoUrl(request.getPhotoUrl())
                .status(request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE)
                .rating(BigDecimal.valueOf(5.0))
                .totalTrips(0)
                .build();

        Driver saved = driverRepository.save(driver);
        log.info("[FLEET] Registered new chauffeur {} (License: {}) for vendor {}", saved.getId(), saved.getLicenseNumber(), user.getEmail());

        // Audit log event
        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("FLEET")
                    .event("DRIVER_REGISTERED")
                    .userId(user.getId().toString())
                    .userName(user.getName())
                    .userRole(user.getRole().name())
                    .module("FLEET_MANAGEMENT")
                    .targetEntity("Driver: " + saved.getName())
                    .details("Added chauffeur " + saved.getName() + " (Lic: " + saved.getLicenseNumber() + ") with " + saved.getExperienceYears() + " yrs exp")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("[FLEET] Failed to log audit event for driver registration: {}", ex.getMessage());
        }

        return DriverResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getVendorDrivers(UUID vendorUserId) {
        return driverRepository.findByUserIdOrderByCreatedAtDesc(vendorUserId)
                .stream()
                .map(DriverResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverById(UUID vendorUserId, UUID driverId) {
        Driver driver = driverRepository.findByIdAndUserId(driverId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found or you do not have permission to view it"));
        return DriverResponse.fromEntity(driver);
    }

    @Transactional
    public void deleteDriver(UUID vendorUserId, UUID driverId) {
        Driver driver = driverRepository.findByIdAndUserId(driverId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found or you do not have permission to remove it"));

        driverRepository.delete(driver);
        log.info("[FLEET] Deleted chauffeur {} (Lic: {}) for vendor {}", driver.getId(), driver.getLicenseNumber(), vendorUserId);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("FLEET")
                    .event("DRIVER_REMOVED")
                    .userId(vendorUserId.toString())
                    .userName(driver.getUser().getName())
                    .userRole(driver.getUser().getRole().name())
                    .module("FLEET_MANAGEMENT")
                    .targetEntity("Driver: " + driver.getName())
                    .details("Removed chauffeur " + driver.getName() + " (Lic: " + driver.getLicenseNumber() + ")")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("[FLEET] Failed to log audit event for driver deletion: {}", ex.getMessage());
        }
    }

    @Transactional
    public DriverResponse updateDriver(UUID vendorUserId, UUID driverId, UpdateDriverRequest request) {
        Driver driver = driverRepository.findByIdAndUserId(driverId, vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found or you do not have permission to modify it"));

        String normalizedLicense = request.getLicenseNumber().trim().toUpperCase();

        if (!driver.getLicenseNumber().equalsIgnoreCase(normalizedLicense) &&
                driverRepository.existsByLicenseNumberIgnoreCase(normalizedLicense)) {
            throw new IllegalArgumentException("Driver with commercial license '" + normalizedLicense + "' is already registered in the platform");
        }

        Vehicle assignedVehicle = null;
        if (request.getAssignedVehicleId() != null) {
            assignedVehicle = vehicleRepository.findByIdAndUserId(request.getAssignedVehicleId(), vendorUserId)
                    .orElse(null);
        }

        driver.setName(request.getName().trim());
        driver.setPhone(request.getPhone().trim());
        driver.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        driver.setAddress(request.getAddress().trim());
        driver.setDob(request.getDob());
        driver.setBloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null);
        driver.setEmergencyContact(request.getEmergencyContact().trim());
        driver.setLicenseNumber(normalizedLicense);
        driver.setLicenseExpiry(request.getLicenseExpiry());
        driver.setExperienceYears(request.getExperienceYears());
        driver.setAssignedVehicle(assignedVehicle);

        if (request.getLicenseDocumentUrl() != null && !request.getLicenseDocumentUrl().isBlank()) {
            driver.setLicenseDocumentUrl(request.getLicenseDocumentUrl().trim());
        }

        if (request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank()) {
            driver.setPhotoUrl(request.getPhotoUrl().trim());
        }

        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }

        Driver saved = driverRepository.save(driver);
        log.info("[FLEET] Updated chauffeur {} ({}) for vendor {}", saved.getId(), saved.getName(), vendorUserId);

        try {
            auditLogService.logEvent(CreateAuditLogRequest.builder()
                    .category("FLEET")
                    .event("DRIVER_UPDATED")
                    .userId(vendorUserId.toString())
                    .userName(driver.getUser().getName())
                    .userRole(driver.getUser().getRole().name())
                    .module("FLEET_MANAGEMENT")
                    .targetEntity("Driver: " + saved.getName())
                    .details("Updated particulars for chauffeur " + saved.getName() + " (Lic: " + saved.getLicenseNumber() + ")")
                    .status("SUCCESS")
                    .build());
        } catch (Exception ex) {
            log.warn("[FLEET] Failed to log audit event for driver update: {}", ex.getMessage());
        }

        return DriverResponse.fromEntity(saved);
    }
}

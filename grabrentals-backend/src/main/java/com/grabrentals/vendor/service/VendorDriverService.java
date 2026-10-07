package com.grabrentals.vendor.service;

import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.service.AuditLogService;
import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.vendor.dto.CreateDriverRequest;
import com.grabrentals.vendor.dto.DriverResponse;
import com.grabrentals.vendor.dto.UpdateDriverRequest;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorDriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public DriverResponse registerDriver(UUID vendorUserId, CreateDriverRequest request) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + vendorUserId));

        String rawLicense = request.getLicenseNumber() != null ? request.getLicenseNumber().trim() : "";
        String normalizedLicense = !rawLicense.isBlank()
                ? rawLicense.toUpperCase()
                : "DL-PENDING-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDate resolvedLicenseExpiry = request.getLicenseExpiry() != null
                ? request.getLicenseExpiry()
                : LocalDate.now().plusYears(10);

        if (!rawLicense.isBlank()) {
            String compactLicense = rawLicense.replaceAll("[\\s-]+", "").toUpperCase();
            Optional<Driver> existingOpt = driverRepository.findByNormalizedLicenseNumber(compactLicense);
            if (existingOpt.isPresent()) {
                Driver existing = existingOpt.get();
                if (existing.getUser() != null && existing.getUser().getId().equals(vendorUserId)) {
                    throw new IllegalArgumentException("Driver with commercial license '" + rawLicense.toUpperCase() + "' is already registered in your chauffeur roster. Duplicate driver entries are not allowed.");
                } else {
                    throw new IllegalArgumentException("Driver with commercial license '" + rawLicense.toUpperCase() + "' is already registered on Grab Rentals by another fleet partner. Duplicate driver profiles across vendors are strictly prohibited.");
                }
            }
        }

        Vehicle assignedVehicle = null;
        if (request.getAssignedVehicleId() != null) {
            assignedVehicle = vehicleRepository.findByIdAndUserId(request.getAssignedVehicleId(), vendorUserId)
                    .orElse(null);
        }

        // Experience calculation: if experienceYears is null and drivingSince is provided
        Integer calculatedExp = request.getExperienceYears();
        if (calculatedExp == null && request.getDrivingSince() != null) {
            calculatedExp = Math.max(0, java.time.Period.between(request.getDrivingSince(), java.time.LocalDate.now()).getYears());
        }
        if (calculatedExp == null) {
            calculatedExp = 0;
        }

        String emergencyContactCombined = request.getEmergencyContact() != null ? request.getEmergencyContact().trim() : "";
        if (request.getEmergencyContactName() != null && !request.getEmergencyContactName().isBlank()) {
            emergencyContactCombined = request.getEmergencyContactName().trim() + 
                (request.getEmergencyContactPhone() != null ? " (" + request.getEmergencyContactPhone().trim() + ")" : "");
        }

        Driver driver = Driver.builder()
                .user(user)
                .name(request.getName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .dob(request.getDob())
                .gender(request.getGender() != null ? request.getGender().trim() : null)
                .bloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null)
                .idProofType(request.getIdProofType() != null ? request.getIdProofType().trim() : null)
                .idProofNumber(request.getIdProofNumber() != null ? request.getIdProofNumber().trim() : null)
                .idProofDocumentUrl(request.getIdProofDocumentUrl() != null ? request.getIdProofDocumentUrl().trim() : null)
                .licenseClass(request.getLicenseClass() != null ? request.getLicenseClass().trim() : null)
                .drivingSince(request.getDrivingSince())
                .joiningDate(request.getJoiningDate())
                .addressProofType(request.getAddressProofType() != null ? request.getAddressProofType().trim() : null)
                .addressProofNumber(request.getAddressProofNumber() != null ? request.getAddressProofNumber().trim() : null)
                .addressProofDocumentUrl(request.getAddressProofDocumentUrl() != null ? request.getAddressProofDocumentUrl().trim() : null)
                .emergencyContact(emergencyContactCombined)
                .emergencyContactName(request.getEmergencyContactName() != null ? request.getEmergencyContactName().trim() : null)
                .emergencyContactPhone(request.getEmergencyContactPhone() != null ? request.getEmergencyContactPhone().trim() : null)
                .languagesSpoken(request.getLanguagesSpoken() != null ? request.getLanguagesSpoken().trim() : null)
                .verificationStatus(request.getVerificationStatus() != null ? request.getVerificationStatus().trim() : "Pending")
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .licenseNumber(normalizedLicense)
                .licenseExpiry(resolvedLicenseExpiry)
                .experienceYears(calculatedExp)
                .assignedVehicle(assignedVehicle)
                .licenseDocumentUrl(request.getLicenseDocumentUrl())
                .photoUrl(request.getPhotoUrl())
                .status(request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE)
                .rating(request.getRating() != null ? request.getRating() : BigDecimal.valueOf(5.0))
                .totalTrips(request.getTotalTrips() != null ? request.getTotalTrips() : 0)
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

        String rawLicense = request.getLicenseNumber() != null ? request.getLicenseNumber().trim() : "";
        if (!rawLicense.isBlank()) {
            String compactLicense = rawLicense.replaceAll("[\\s-]+", "").toUpperCase();
            Optional<Driver> duplicateOpt = driverRepository.findByNormalizedLicenseNumber(compactLicense);
            if (duplicateOpt.isPresent() && !duplicateOpt.get().getId().equals(driverId)) {
                Driver other = duplicateOpt.get();
                if (other.getUser() != null && other.getUser().getId().equals(vendorUserId)) {
                    throw new IllegalArgumentException("Driver with commercial license '" + rawLicense.toUpperCase() + "' is already registered to another chauffeur in your roster.");
                } else {
                    throw new IllegalArgumentException("Driver with commercial license '" + rawLicense.toUpperCase() + "' is already registered on Grab Rentals by another fleet partner. Duplicate driver profiles across vendors are strictly prohibited.");
                }
            }
        }

        Vehicle assignedVehicle = null;
        if (request.getAssignedVehicleId() != null) {
            assignedVehicle = vehicleRepository.findByIdAndUserId(request.getAssignedVehicleId(), vendorUserId)
                    .orElse(null);
        }

        driver.setName(request.getName().trim());
        driver.setPhone(request.getPhone().trim());
        driver.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        if (request.getAddress() != null) driver.setAddress(request.getAddress().trim());
        driver.setDob(request.getDob());
        if (request.getGender() != null) driver.setGender(request.getGender().trim());
        driver.setBloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null);
        if (request.getIdProofType() != null) driver.setIdProofType(request.getIdProofType().trim());
        if (request.getIdProofNumber() != null) driver.setIdProofNumber(request.getIdProofNumber().trim());
        if (request.getIdProofDocumentUrl() != null && !request.getIdProofDocumentUrl().isBlank()) {
            driver.setIdProofDocumentUrl(request.getIdProofDocumentUrl().trim());
        }
        if (request.getLicenseClass() != null) driver.setLicenseClass(request.getLicenseClass().trim());
        if (request.getDrivingSince() != null) driver.setDrivingSince(request.getDrivingSince());
        if (request.getJoiningDate() != null) driver.setJoiningDate(request.getJoiningDate());
        if (request.getAddressProofType() != null) driver.setAddressProofType(request.getAddressProofType().trim());
        if (request.getAddressProofNumber() != null) driver.setAddressProofNumber(request.getAddressProofNumber().trim());
        if (request.getAddressProofDocumentUrl() != null && !request.getAddressProofDocumentUrl().isBlank()) {
            driver.setAddressProofDocumentUrl(request.getAddressProofDocumentUrl().trim());
        }
        if (request.getEmergencyContactName() != null) driver.setEmergencyContactName(request.getEmergencyContactName().trim());
        if (request.getEmergencyContactPhone() != null) driver.setEmergencyContactPhone(request.getEmergencyContactPhone().trim());
        if (request.getLanguagesSpoken() != null) driver.setLanguagesSpoken(request.getLanguagesSpoken().trim());
        if (request.getVerificationStatus() != null) driver.setVerificationStatus(request.getVerificationStatus().trim());
        if (request.getNotes() != null) driver.setNotes(request.getNotes().trim());
        if (!rawLicense.isBlank()) {
            driver.setLicenseNumber(rawLicense.toUpperCase());
        }
        driver.setLicenseExpiry(request.getLicenseExpiry());
        
        Integer calculatedExp = request.getExperienceYears();
        if (calculatedExp == null && request.getDrivingSince() != null) {
            calculatedExp = Math.max(0, java.time.Period.between(request.getDrivingSince(), java.time.LocalDate.now()).getYears());
        }
        if (calculatedExp != null) {
            driver.setExperienceYears(calculatedExp);
        }
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

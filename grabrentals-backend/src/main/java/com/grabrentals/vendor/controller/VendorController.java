package com.grabrentals.vendor.controller;

import com.grabrentals.common.exception.UserNotFoundException;
import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.customer.dto.BookingResponse;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.customer.service.CustomerBookingService;
import com.grabrentals.security.CustomUserDetails;
import com.grabrentals.security.CustomUserDetailsService;
import com.grabrentals.security.JwtService;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import com.grabrentals.vendor.dto.DriverResponse;
import com.grabrentals.vendor.dto.VehicleResponse;
import com.grabrentals.vendor.entity.Driver;
import com.grabrentals.vendor.entity.DriverStatus;
import com.grabrentals.vendor.entity.Vehicle;
import com.grabrentals.vendor.entity.VehicleStatus;
import com.grabrentals.vendor.entity.VendorProfile;
import com.grabrentals.vendor.repository.DriverRepository;
import com.grabrentals.vendor.repository.VehicleRepository;
import com.grabrentals.vendor.repository.VendorProfileRepository;
import com.grabrentals.vendor.service.CloudinaryService;
import com.grabrentals.vendor.service.VendorDriverService;
import com.grabrentals.vendor.service.VendorVehicleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping({"/api/vendor", "/api/fleet"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FLEET', 'VENDOR', 'ADMIN')")
public class VendorController {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;
    private final VendorVehicleService vendorVehicleService;
    private final VendorDriverService vendorDriverService;
    private final CustomerBookingService customerBookingService;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @PreAuthorize("permitAll()")
    @PostMapping(value = {"/profile/upload", "/compliance/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProofDocument(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "grabrentals/business") String folder,
            @RequestParam(value = "preset", required = false, defaultValue = "grabrentals_business") String preset,
            HttpServletRequest request
    ) {
        String userEmail = userDetails != null ? userDetails.getEmail() : "onboarding-partner";
        String userId = userDetails != null && userDetails.getId() != null ? userDetails.getId().toString() : "new";
        log.info("[HTTP API] POST /api/vendor/profile/upload by vendor '{}' ({}) [preset: {}]", userEmail, userId, preset);
        String url = cloudinaryService.uploadFile(file, folder, preset);
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Document proof uploaded successfully")
                .data(Map.of("url", url))
                .path(request.getRequestURI())
                .build());
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        List<Vehicle> vehicles = vehicleRepository.findByUserIdOrderByCreatedAtDesc(vendorId);
        List<Driver> drivers = driverRepository.findByUserIdOrderByCreatedAtDesc(vendorId);
        List<Booking> bookings = bookingRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);

        long totalVehicles = vehicles.size();
        long availableVehicles = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();

        long totalDrivers = drivers.size();
        long availableDrivers = drivers.stream().filter(d -> d.getStatus() == DriverStatus.AVAILABLE).count();

        long pendingRequests = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.ASSIGNED_TO_VENDOR)
                .count();

        long activeTrips = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                        || b.getStatus() == BookingStatus.ON_THE_WAY
                        || b.getStatus() == BookingStatus.IN_TRANSIT)
                .count();

        long completedTrips = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        long cancelledBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED
                        || b.getStatus() == BookingStatus.REASSIGN_REQUIRED)
                .count();

        BigDecimal totalEarnings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED && b.getTotalFare() != null)
                .map(Booking::getTotalFare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> kpi = new HashMap<>();
        kpi.put("totalVehicles", totalVehicles);
        kpi.put("availableVehicles", availableVehicles);
        kpi.put("totalDrivers", totalDrivers);
        kpi.put("availableDrivers", availableDrivers);
        kpi.put("pendingRequests", pendingRequests);
        kpi.put("activeTrips", activeTrips);
        kpi.put("completedTrips", completedTrips);
        kpi.put("cancelledBookings", cancelledBookings);
        kpi.put("totalEarnings", totalEarnings);
        kpi.put("netEarnings", totalEarnings.multiply(BigDecimal.valueOf(0.90))); // 90% vendor payout
        kpi.put("pendingPayout", totalEarnings.multiply(BigDecimal.valueOf(0.25)));

        List<BookingResponse> recentBookings = bookings.stream()
                .limit(10)
                .map(BookingResponse::fromEntity)
                .toList();

        List<VehicleResponse> vehicleResponses = vendorVehicleService.getVendorVehicles(vendorId);
        List<DriverResponse> driverResponses = vendorDriverService.getVendorDrivers(vendorId);

        Map<String, Object> data = new HashMap<>();
        data.put("kpi", kpi);
        data.put("recentBookings", recentBookings);
        data.put("vehicles", vehicleResponses);
        data.put("drivers", driverResponses);

        return ResponseEntity.ok(ApiResponse.success("Dynamic vendor dashboard data", data));
    }

    @GetMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        VendorProfile profile = vendorProfileRepository.findByUserId(vendorId)
                .orElseGet(() -> {
                    int num = Math.abs(vendorId.hashCode() % 900000) + 100000;
                    VendorProfile newProfile = VendorProfile.builder()
                            .user(vendor)
                            .vendorIdCode("GR-VND-" + num)
                            .companyName(vendor.getBusinessName() != null && !vendor.getBusinessName().isBlank()
                                    ? vendor.getBusinessName()
                                    : vendor.getName() + " Logistics")
                            .contactPerson(vendor.getName())
                            .tradeName(vendor.getName())
                            .address(vendor.getCity() != null ? vendor.getCity() : "India")
                            .fleetSize((int) vehicleRepository.countByUserId(vendorId))
                            .build();
                    return vendorProfileRepository.save(newProfile);
                });

        if (profile.getVendorIdCode() == null || profile.getVendorIdCode().isBlank()) {
            int num = Math.abs(vendorId.hashCode() % 900000) + 100000;
            profile.setVendorIdCode("GR-VND-" + num);
            profile = vendorProfileRepository.save(profile);
        }

        String resolvedBusinessName = profile.getCompanyName();
        if (resolvedBusinessName == null || resolvedBusinessName.isBlank()) {
            resolvedBusinessName = vendor.getBusinessName();
        }
        boolean hasRegisteredBusiness = resolvedBusinessName != null && 
                !resolvedBusinessName.isBlank() && 
                !resolvedBusinessName.equalsIgnoreCase("Fleet Partner");

        if (!hasRegisteredBusiness) {
            resolvedBusinessName = (vendor.getName() != null && !vendor.getName().isBlank())
                    ? vendor.getName() + " Fleet"
                    : "Individual Fleet Partner";
        }

        String resolvedTradeName = profile.getTradeName();
        if (resolvedTradeName == null || resolvedTradeName.isBlank()) {
            resolvedTradeName = resolvedBusinessName;
        }

        String resolvedAddress = profile.getAddress();
        if (resolvedAddress == null || resolvedAddress.isBlank()) {
            resolvedAddress = vendor.getCity() != null ? vendor.getCity() : "";
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", profile.getId());
        map.put("userId", vendor.getId());
        map.put("vendorId", profile.getVendorIdCode());
        map.put("vendorIdCode", profile.getVendorIdCode());
        map.put("businessName", resolvedBusinessName);
        map.put("tradeName", resolvedTradeName);
        map.put("ownerName", vendor.getName() != null ? vendor.getName() : "");
        map.put("contactPerson", profile.getContactPerson() != null && !profile.getContactPerson().isBlank() ? profile.getContactPerson() : (vendor.getName() != null ? vendor.getName() : ""));
        map.put("email", vendor.getEmail());
        map.put("phone", vendor.getPhone());
        map.put("altPhone", vendor.getAlternatePhone() != null ? vendor.getAlternatePhone() : "");
        map.put("address", resolvedAddress);
        map.put("gstin", profile.getGstin() != null ? profile.getGstin() : "");
        map.put("pan", profile.getPan() != null ? profile.getPan() : "");
        map.put("bankName", profile.getBankName() != null ? profile.getBankName() : "");
        map.put("accountNumber", profile.getAccountNumber() != null ? profile.getAccountNumber() : "");
        map.put("ifsc", profile.getIfsc() != null ? profile.getIfsc() : "");
        map.put("branch", profile.getBranch() != null ? profile.getBranch() : "");
        map.put("fleetSize", vehicleRepository.countByUserId(vendorId));
        map.put("isIndividual", !hasRegisteredBusiness);
        map.put("gstDocumentUrl", profile.getGstDocumentUrl() != null ? profile.getGstDocumentUrl() : "");
        map.put("panDocumentUrl", profile.getPanDocumentUrl() != null ? profile.getPanDocumentUrl() : "");
        map.put("bankProofDocumentUrl", profile.getBankProofDocumentUrl() != null ? profile.getBankProofDocumentUrl() : "");
        map.put("businessProofDocumentUrl", profile.getBusinessProofDocumentUrl() != null ? profile.getBusinessProofDocumentUrl() : "");
        map.put("idProofDocumentUrl", profile.getIdProofDocumentUrl() != null ? profile.getIdProofDocumentUrl() : "");
        map.put("addressProofDocumentUrl", profile.getAddressProofDocumentUrl() != null ? profile.getAddressProofDocumentUrl() : "");
        boolean hasPassword = Boolean.TRUE.equals(vendor.getPasswordSet());
        map.put("hasPassword", hasPassword);

        return ResponseEntity.ok(ApiResponse.success("Vendor profile retrieved successfully", map));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> updates
    ) {
        User vendor = getUser(userDetails);
        UUID vendorId = vendor.getId();

        VendorProfile profile = vendorProfileRepository.findByUserId(vendorId)
                .orElseGet(() -> {
                    String initialCompany = vendor.getBusinessName();
                    if (initialCompany == null || initialCompany.isBlank()) {
                        initialCompany = (vendor.getName() != null && !vendor.getName().isBlank())
                                ? vendor.getName() + " Logistics"
                                : "Fleet Partner Logistics";
                    }
                    int num = Math.abs(vendorId.hashCode() % 900000) + 100000;
                    return VendorProfile.builder()
                            .user(vendor)
                            .vendorIdCode("GR-VND-" + num)
                            .companyName(initialCompany)
                            .contactPerson(vendor.getName())
                            .tradeName(initialCompany)
                            .address(vendor.getCity() != null ? vendor.getCity() : "")
                            .fleetSize(0)
                            .build();
                });

        String businessName = extractStr(updates, "businessName");
        if (businessName != null) {
            profile.setCompanyName(businessName);
            vendor.setBusinessName(businessName);
        }

        String tradeName = extractStr(updates, "tradeName");
        if (tradeName != null) profile.setTradeName(tradeName);

        String contactPerson = extractStr(updates, "contactPerson");
        if (contactPerson != null) profile.setContactPerson(contactPerson);

        String address = extractStr(updates, "address");
        if (address != null) profile.setAddress(address);

        String gstin = extractStr(updates, "gstin");
        if (gstin != null) profile.setGstin(gstin);

        String pan = extractStr(updates, "pan");
        if (pan != null) profile.setPan(pan);

        String bankName = extractStr(updates, "bankName");
        if (bankName != null) profile.setBankName(bankName);

        String accountNumber = extractStr(updates, "accountNumber");
        if (accountNumber != null) profile.setAccountNumber(accountNumber);

        String ifsc = extractStr(updates, "ifsc");
        if (ifsc != null) profile.setIfsc(ifsc);

        String branch = extractStr(updates, "branch");
        if (branch != null) profile.setBranch(branch);

        String altPhone = extractStr(updates, "altPhone");
        if (altPhone == null) altPhone = extractStr(updates, "alternatePhone");
        if (altPhone != null) vendor.setAlternatePhone(altPhone);

        String phone = extractStr(updates, "phone");
        if (phone != null) vendor.setPhone(phone);

        String ownerName = extractStr(updates, "ownerName");
        if (ownerName == null) ownerName = extractStr(updates, "name");
        if (ownerName != null) vendor.setName(ownerName);

        String city = extractStr(updates, "city");
        if (city != null) {
            vendor.setCity(city);
            if (profile.getAddress() == null || profile.getAddress().isBlank()) {
                profile.setAddress(city);
            }
        }

        if (updates.containsKey("email")) {
            String newEmail = extractStr(updates, "email");
            if (newEmail != null) {
                newEmail = newEmail.toLowerCase();
                if (!newEmail.equalsIgnoreCase(vendor.getEmail())) {
                    boolean emailTaken = userRepository.findByEmail(newEmail)
                            .filter(existing -> !existing.getId().equals(vendorId))
                            .isPresent();
                    if (emailTaken) {
                        throw new IllegalArgumentException("Email is already registered to another account: " + newEmail);
                    }
                    customUserDetailsService.evictUser(vendor.getEmail());
                    vendor.setEmail(newEmail);
                }
            }
        }

        String gstDoc = extractStr(updates, "gstDocumentUrl");
        if (gstDoc != null) profile.setGstDocumentUrl(gstDoc);

        String panDoc = extractStr(updates, "panDocumentUrl");
        if (panDoc != null) profile.setPanDocumentUrl(panDoc);

        String bankProofDoc = extractStr(updates, "bankProofDocumentUrl");
        if (bankProofDoc != null) profile.setBankProofDocumentUrl(bankProofDoc);

        String bizProofDoc = extractStr(updates, "businessProofDocumentUrl");
        if (bizProofDoc != null) profile.setBusinessProofDocumentUrl(bizProofDoc);

        String idProofDoc = extractStr(updates, "idProofDocumentUrl");
        if (idProofDoc != null) profile.setIdProofDocumentUrl(idProofDoc);

        String addressProofDoc = extractStr(updates, "addressProofDocumentUrl");
        if (addressProofDoc != null) profile.setAddressProofDocumentUrl(addressProofDoc);

        userRepository.save(vendor);
        profile.setFleetSize((int) vehicleRepository.countByUserId(vendorId));
        vendorProfileRepository.save(profile);

        customUserDetailsService.evictUser(vendor.getEmail());
        customUserDetailsService.evictUser("id:" + vendorId);

        ResponseEntity<ApiResponse<Map<String, Object>>> profileResp = getProfile(userDetails);
        Map<String, Object> data = new HashMap<>(profileResp.getBody().getData());
        String freshToken = jwtService.generateToken(vendor);
        data.put("token", freshToken);
        data.put("accessToken", freshToken);

        return ResponseEntity.ok(ApiResponse.success("Vendor profile updated successfully", data));
    }

    private String extractStr(Map<String, Object> map, String key) {
        if (!map.containsKey(key)) return null;
        Object val = map.get(key);
        if (val == null) return null;
        String str = String.valueOf(val).trim();
        return str.isEmpty() ? null : str;
    }

    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        User user = getUser(userDetails);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }

        // If user already has a custom password set, require and verify currentPassword
        if (Boolean.TRUE.equals(user.getPasswordSet())) {
            if (currentPassword == null || currentPassword.isBlank()) {
                throw new IllegalArgumentException("Current password is required");
            }
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new IllegalArgumentException("Current password does not match");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        user.setPasswordSet(true);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    private User getUser(CustomUserDetails userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userDetails.getId()));
    }
}

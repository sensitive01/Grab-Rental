package com.grabrentals.config;

import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.entity.UserStatus;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final com.grabrentals.audit.repository.AuditLogRepository auditLogRepository;

    @Value("${app.seed.admin.enabled:true}")
    private boolean seedAdminEnabled;

    @Value("${app.seed.admin.name:Super Administrator}")
    private String adminName;

    @Value("${app.seed.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.seed.admin.password:Admin@123456}")
    private String adminPassword;

    @Value("${app.seed.admin.phone:+919876543210}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (!seedAdminEnabled) {
            log.info("Admin seeding is disabled by configuration.");
            return;
        }

        // 1. Seed Primary System Admin from .env configuration
        seedUser(adminName, adminEmail, adminPhone, adminPassword, Role.ADMIN, UserStatus.ACTIVE, "Grab Rentals HQ");

        // 2. Seed initial Audit & Activity logs if table is empty
        seedAuditLogs();

        log.info("System Admin account verified and seeded into PostgreSQL database.");
    }

    private void seedAuditLogs() {
        if (auditLogRepository.count() > 0) {
            log.info("Audit logs table already contains {} records. Skipping seeding.", auditLogRepository.count());
            return;
        }

        java.time.Instant now = java.time.Instant.now();
        List<com.grabrentals.audit.entity.AuditLog> initialLogs = List.of(
            // Security Audit Logs
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("SECURITY")
                .event("USER_PROVISIONED")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .ipAddress("103.21.144.92")
                .device("Chrome 128 / Linux x86_64")
                .status("SUCCESS")
                .details("System Administrator provisioned primary platform admin account")
                .createdAt(now.minusSeconds(7200))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("SECURITY")
                .event("LOGIN_SUCCESS")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .ipAddress("103.21.144.92")
                .device("Chrome 128 / Linux x86_64")
                .status("SUCCESS")
                .details("Administrative session authenticated successfully with JWT issued")
                .createdAt(now.minusSeconds(5400))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("SECURITY")
                .event("CHANGE_PASSWORD")
                .userId("divya.ops@grabrentals.com")
                .userName("Divya Bharathi")
                .userRole("OPERATIONS")
                .ipAddress("182.73.18.24")
                .device("Edge 127 / Windows 11")
                .status("SUCCESS")
                .details("User password changed successfully via self-service security settings")
                .createdAt(now.minusSeconds(3600))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("SECURITY")
                .event("LOGIN_FAILED")
                .userId("unauthorized@unknown.com")
                .userName("Unknown Identity")
                .userRole("UNKNOWN")
                .ipAddress("45.133.1.88")
                .device("Python-Requests / Unknown")
                .status("FAILED")
                .details("Failed login attempt: invalid credentials (potential brute-force attempt blocked)")
                .createdAt(now.minusSeconds(2400))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("SECURITY")
                .event("USER_STATUS_CHANGE")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .ipAddress("103.21.144.92")
                .device("Chrome 128 / Linux x86_64")
                .status("WARNING")
                .details("Toggled user account status to ACTIVE after compliance review")
                .createdAt(now.minusSeconds(1200))
                .build(),

            // Activity Logs
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("ACTIVITY")
                .event("UPDATE_PRICING")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .module("Tariffs & Pricing")
                .targetEntity("Sedan / Outstation")
                .ipAddress("103.21.144.92")
                .status("SUCCESS")
                .details("Updated base fare from ₹14/km to ₹16/km for festive weekend peak surge")
                .createdAt(now.minusSeconds(6800))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("ACTIVITY")
                .event("ALLOCATE_DRIVER")
                .userId("karthik.ops@grabrentals.com")
                .userName("Karthik Narayanan")
                .userRole("OPERATIONS")
                .module("Trip Dispatch")
                .targetEntity("BK-88219 (Suresh Babu)")
                .ipAddress("182.73.18.24")
                .status("SUCCESS")
                .details("Manually re-allocated verified driver Suresh Babu to VIP Airport transfer")
                .createdAt(now.minusSeconds(4900))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("ACTIVITY")
                .event("APPROVE_VENDOR")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .module("Vendor Management")
                .targetEntity("Royal Travels Chennai")
                .ipAddress("103.21.144.92")
                .status("SUCCESS")
                .details("Approved vendor onboarding application and configured commission rate at 12%")
                .createdAt(now.minusSeconds(3100))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("ACTIVITY")
                .event("AUTHORIZE_REFUND")
                .userId(adminEmail)
                .userName(adminName)
                .userRole("ADMIN")
                .module("Finance & Billing")
                .targetEntity("REF-4091 / BK-7701")
                .ipAddress("103.21.144.92")
                .status("SUCCESS")
                .details("Authorized full refund of ₹4,200 to customer wallet due to vehicle breakdown")
                .createdAt(now.minusSeconds(1800))
                .build(),
            com.grabrentals.audit.entity.AuditLog.builder()
                .category("ACTIVITY")
                .event("TRIP_DISPATCHED")
                .userId("divya.ops@grabrentals.com")
                .userName("Divya Bharathi")
                .userRole("OPERATIONS")
                .module("Dispatch Engine")
                .targetEntity("BK-9912 (Bangalore -> Coorg)")
                .ipAddress("182.73.18.24")
                .status("SUCCESS")
                .details("Dispatched Innova Crysta for multi-day outstation tour with live telemetry enabled")
                .createdAt(now.minusSeconds(600))
                .build()
        );

        auditLogRepository.saveAll(initialLogs);
        log.info("Seeded {} initial audit & activity logs into PostgreSQL database.", initialLogs.size());
    }

    private void seedUser(String name, String email, String phone, String password, Role role, UserStatus status, String businessName) {
        String normalizedEmail = email.toLowerCase().trim();
        String normalizedPhone = phone.trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
                // Ensure password matches seed so login is guaranteed
                user.setPassword(passwordEncoder.encode(password));
                user.setName(name);
                user.setRole(role);
                user.setBusinessName(businessName);
                userRepository.save(user);
                log.info("Updated existing user '{}' to ensure seed password and details match.", normalizedEmail);
            });
            return;
        }

        if (userRepository.existsByPhone(normalizedPhone)) {
            log.info("Phone '{}' already registered for another account. Skipping.", normalizedPhone);
            return;
        }

        User newUser = User.builder()
                .name(name)
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .password(passwordEncoder.encode(password))
                .role(role)
                .status(status)
                .businessName(businessName)
                .build();

        userRepository.save(newUser);
        log.info("Seeded user '{}' with role {} into database.", normalizedEmail, role);
    }
}

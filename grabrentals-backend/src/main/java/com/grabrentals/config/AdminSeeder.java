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

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        // Only seed Primary System Admin from configuration
        seedUser(adminName, adminEmail, adminPhone, adminPassword, Role.ADMIN, UserStatus.ACTIVE, "Grab Rentals HQ");
        log.info("System Admin account verified and seeded into PostgreSQL database.");
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

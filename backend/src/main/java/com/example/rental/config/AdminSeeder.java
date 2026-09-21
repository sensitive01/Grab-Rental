package com.example.rental.config;

import com.example.rental.user.entity.Role;
import com.example.rental.user.entity.User;
import com.example.rental.user.entity.UserStatus;
import com.example.rental.user.repository.UserRepository;
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

        String normalizedEmail = adminEmail.toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            log.info("Default admin account '{}' already exists. Skipping seed.", normalizedEmail);
            return;
        }

        User adminUser = User.builder()
                .name(adminName)
                .email(normalizedEmail)
                .phone(adminPhone)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(adminUser);
        log.info("Default admin account successfully seeded with email: {}", normalizedEmail);
    }
}

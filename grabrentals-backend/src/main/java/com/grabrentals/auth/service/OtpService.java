package com.grabrentals.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.auth.dto.SendOtpResponse;
import com.grabrentals.common.exception.InvalidCredentialsException;
import com.grabrentals.common.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OtpService {

    private static final int OTP_EXPIRY_SECONDS = 300; // 5 minutes
    private static final int COOLDOWN_SECONDS = 60; // 60 seconds minimum between OTP requests
    private static final int MAX_HOURLY_REQUESTS = 5; // Max 5 OTPs per hour per phone
    private static final int MAX_VERIFY_ATTEMPTS = 5; // Lockout after 5 wrong OTPs
    private static final int LOCKOUT_MINUTES = 15; // 15 minutes lockout
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    @Value("${app.whatsapp.api-url:}")
    private String whatsappApiUrl;

    @Value("${app.whatsapp.api-key:}")
    private String whatsappApiKey;

    @Value("${app.whatsapp.support-phone:9876543210}")
    private String whatsappSupportPhone;

    @Value("${app.otp.expose-dev-otp:false}")
    private boolean exposeDevOtp;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    private final Map<String, OtpRecord> otpCache = new ConcurrentHashMap<>();
    private final Map<String, PhoneRateLimit> rateLimitCache = new ConcurrentHashMap<>();

    public OtpService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    private record OtpRecord(String code, Instant expiresAt, int attempts, Instant createdAt) {
        OtpRecord incrementAttempts() {
            return new OtpRecord(this.code, this.expiresAt, this.attempts + 1, this.createdAt);
        }

        boolean isExpired() {
            return Instant.now().isAfter(this.expiresAt);
        }
    }

    private static class PhoneRateLimit {
        private Instant lastRequestTime = Instant.EPOCH;
        private int hourlyCount = 0;
        private Instant hourWindowStart = Instant.now();
        private Instant lockedUntil = Instant.EPOCH;

        boolean isLocked() {
            return Instant.now().isBefore(lockedUntil);
        }

        long remainingLockoutSeconds() {
            return Math.max(0, Duration.between(Instant.now(), lockedUntil).getSeconds());
        }

        long remainingCooldownSeconds() {
            long elapsed = Duration.between(lastRequestTime, Instant.now()).getSeconds();
            return Math.max(0, COOLDOWN_SECONDS - elapsed);
        }

        void recordRequest() {
            Instant now = Instant.now();
            if (Duration.between(hourWindowStart, now).toHours() >= 1) {
                hourlyCount = 0;
                hourWindowStart = now;
            }
            hourlyCount++;
            lastRequestTime = now;
        }

        void lock() {
            lockedUntil = Instant.now().plus(Duration.ofMinutes(LOCKOUT_MINUTES));
        }
    }

    public SendOtpResponse generateAndSendOtp(String rawPhone) {
        String phone = normalizePhone(rawPhone);
        PhoneRateLimit rateLimit = rateLimitCache.computeIfAbsent(phone, k -> new PhoneRateLimit());

        // Check if locked out
        if (rateLimit.isLocked()) {
            long mins = (rateLimit.remainingLockoutSeconds() / 60) + 1;
            throw new RateLimitExceededException(
                "Account verification is temporarily locked due to excessive failed attempts. Please try again in " + mins + " minutes."
            );
        }

        // Check cooldown between requests (60 seconds)
        long remainingCooldown = rateLimit.remainingCooldownSeconds();
        if (remainingCooldown > 0) {
            throw new RateLimitExceededException(
                "Please wait " + remainingCooldown + " seconds before requesting a new verification code."
            );
        }

        // Check hourly quota (max 5)
        if (rateLimit.hourlyCount >= MAX_HOURLY_REQUESTS) {
            throw new RateLimitExceededException(
                "Maximum hourly OTP request limit reached. Please try again in 1 hour."
            );
        }

        // Generate 6-digit cryptographically secure OTP
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofSeconds(OTP_EXPIRY_SECONDS));

        otpCache.put(phone, new OtpRecord(otp, expiresAt, 0, now));
        rateLimit.recordRequest();

        if (exposeDevOtp) {
            log.info("🔐 [DEV OTP GENERATED] Phone: {} -> OTP: {} (valid for {} seconds)", phone, otp, OTP_EXPIRY_SECONDS);
        } else {
            log.info("🔐 [OTP GENERATED] Phone: {} -> Dispatched to recipient (valid for {} seconds)", phone, OTP_EXPIRY_SECONDS);
        }

        // Dispatch real OTP message via WhatsApp Business Cloud API
        sendWhatsAppOtp(phone, otp);

        return SendOtpResponse.builder()
                .phone(phone)
                .expiresInSeconds(OTP_EXPIRY_SECONDS)
                .devOtp(exposeDevOtp ? otp : null)
                .build();
    }

    private void sendWhatsAppOtp(String rawPhone, String otp) {
        if (!whatsappEnabled || whatsappApiKey == null || whatsappApiKey.isBlank() || whatsappApiUrl == null || whatsappApiUrl.isBlank()) {
            log.info("WhatsApp OTP is disabled or credentials are not configured in environment");
            return;
        }

        String recipient = formatWhatsAppRecipient(rawPhone);
        if (recipient.isBlank()) {
            log.warn("Cannot send WhatsApp OTP: empty recipient phone");
            return;
        }

        try {
            Map<String, Object> bodyParam1 = Map.of("type", "text", "text", otp);
            Map<String, Object> bodyParam2 = Map.of("type", "text", "text", "GrabRentals");
            Map<String, Object> bodyParam3 = Map.of("type", "text", "text", "5 minutes");
            Map<String, Object> bodyParam4 = Map.of("type", "text", "text", whatsappSupportPhone);
            Map<String, Object> bodyParam5 = Map.of("type", "text", "text", whatsappSupportPhone);

            Map<String, Object> bodyComponent = Map.of(
                    "type", "body",
                    "parameters", List.of(bodyParam1, bodyParam2, bodyParam3, bodyParam4, bodyParam5)
            );

            Map<String, Object> buttonComponent = Map.of(
                    "type", "button",
                    "sub_type", "url",
                    "index", "0",
                    "parameters", List.of(Map.of("type", "text", "text", otp))
            );

            Map<String, Object> template = Map.of(
                    "name", "registration",
                    "language", Map.of("code", "en_US"),
                    "components", List.of(bodyComponent, buttonComponent)
            );

            Map<String, Object> payload = Map.of(
                    "messaging_product", "whatsapp",
                    "recipient_type", "individual",
                    "to", recipient,
                    "type", "template",
                    "template", template
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(whatsappApiUrl))
                    .header("Content-Type", "application/json")
                    .header("apikey", whatsappApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> {
                        if (res.statusCode() >= 200 && res.statusCode() < 300) {
                            log.info("✅ WhatsApp OTP successfully dispatched to {} (Status: {}, Body: {})", recipient, res.statusCode(), res.body());
                        } else {
                            log.warn("⚠️ WhatsApp OTP API returned non-200 for {} (Status: {}, Body: {})", recipient, res.statusCode(), res.body());
                        }
                    })
                    .exceptionally(ex -> {
                        log.error("❌ Failed to send WhatsApp OTP to {}: {}", recipient, ex.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.error("❌ Error building WhatsApp OTP request for {}: {}", recipient, e.getMessage(), e);
        }
    }

    public String formatWhatsAppRecipient(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        return digits;
    }

    public boolean verifyOtp(String rawPhone, String inputOtp) {
        String phone = normalizePhone(rawPhone);
        PhoneRateLimit rateLimit = rateLimitCache.computeIfAbsent(phone, k -> new PhoneRateLimit());

        if (rateLimit.isLocked()) {
            long mins = (rateLimit.remainingLockoutSeconds() / 60) + 1;
            throw new RateLimitExceededException(
                "Account verification is temporarily locked. Please try again in " + mins + " minutes."
            );
        }

        OtpRecord record = otpCache.get(phone);

        if (record == null || record.isExpired()) {
            otpCache.remove(phone);
            throw new InvalidCredentialsException("OTP has expired or was not requested. Please request a new code.");
        }

        if (record.attempts() >= MAX_VERIFY_ATTEMPTS - 1 && !record.code().equals(inputOtp.trim())) {
            otpCache.remove(phone);
            rateLimit.lock();
            throw new RateLimitExceededException(
                "Maximum verification attempts exceeded. Account verification locked for " + LOCKOUT_MINUTES + " minutes."
            );
        }

        if (!record.code().equals(inputOtp.trim())) {
            OtpRecord updated = record.incrementAttempts();
            otpCache.put(phone, updated);
            int remainingAttempts = MAX_VERIFY_ATTEMPTS - updated.attempts();
            throw new InvalidCredentialsException("Invalid OTP. " + remainingAttempts + " attempt(s) remaining.");
        }

        // Successfully verified, clear OTP from cache
        otpCache.remove(phone);
        return true;
    }

    public String normalizePhone(String phone) {
        if (phone == null) return "";
        String cleaned = phone.replaceAll("[^0-9+]", "");
        // If 10 digits without prefix, default to standard representation
        if (cleaned.length() == 10 && !cleaned.startsWith("+")) {
            return "+91" + cleaned;
        }
        return cleaned;
    }
}

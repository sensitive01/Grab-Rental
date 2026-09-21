package com.example.rental.auth.service;

import com.example.rental.auth.dto.SendOtpResponse;
import com.example.rental.common.exception.InvalidCredentialsException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OtpService {

    private static final int OTP_EXPIRY_SECONDS = 300; // 5 minutes
    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final Map<String, OtpRecord> otpCache = new ConcurrentHashMap<>();

    private record OtpRecord(String code, Instant expiresAt, int attempts) {
        OtpRecord incrementAttempts() {
            return new OtpRecord(this.code, this.expiresAt, this.attempts + 1);
        }

        boolean isExpired() {
            return Instant.now().isAfter(this.expiresAt);
        }
    }

    public SendOtpResponse generateAndSendOtp(String rawPhone) {
        String phone = normalizePhone(rawPhone);

        // Generate 6-digit cryptographically secure OTP
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plus(Duration.ofSeconds(OTP_EXPIRY_SECONDS));

        otpCache.put(phone, new OtpRecord(otp, expiresAt, 0));

        log.info("🔐 [TESTING OTP GENERATED] Phone: {} -> OTP: {} (valid for {} seconds)", phone, otp, OTP_EXPIRY_SECONDS);

        return SendOtpResponse.builder()
                .phone(phone)
                .expiresInSeconds(OTP_EXPIRY_SECONDS)
                .devOtp(otp)
                .build();
    }

    public boolean verifyOtp(String rawPhone, String inputOtp) {
        String phone = normalizePhone(rawPhone);
        OtpRecord record = otpCache.get(phone);

        if (record == null || record.isExpired()) {
            otpCache.remove(phone);
            throw new InvalidCredentialsException("OTP has expired or was not requested. Please request a new code.");
        }

        if (record.attempts() >= MAX_ATTEMPTS) {
            otpCache.remove(phone);
            throw new InvalidCredentialsException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        if (!record.code().equals(inputOtp.trim())) {
            otpCache.put(phone, record.incrementAttempts());
            throw new InvalidCredentialsException("Invalid OTP");
        }

        // Successfully verified, remove from cache
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

package com.grabrentals.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TokenBlacklistService {

    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    public void blacklistToken(String token, Instant expiresAt) {
        if (token == null || token.isBlank()) return;
        blacklistedTokens.put(token, expiresAt);
        log.info("🚫 JWT token added to blacklist until {}", expiresAt);
        cleanExpiredTokens();
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        Instant expiresAt = blacklistedTokens.get(token);
        if (expiresAt == null) return false;

        if (Instant.now().isAfter(expiresAt)) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

    private void cleanExpiredTokens() {
        Instant now = Instant.now();
        blacklistedTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}

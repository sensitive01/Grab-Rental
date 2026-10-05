package com.grabrentals.security;

import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final java.util.Map<String, CachedUser> userCache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    private record CachedUser(UserDetails userDetails, long expiresAt) {}

    public UserDetails loadUserById(java.util.UUID userId) throws UsernameNotFoundException {
        if (userId == null) {
            throw new UsernameNotFoundException("User ID cannot be null");
        }
        long now = System.currentTimeMillis();
        String key = "id:" + userId;
        CachedUser cached = userCache.get(key);
        if (cached != null && cached.expiresAt() > now) {
            return cached.userDetails();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        UserDetails userDetails = CustomUserDetails.build(user);
        userCache.put(key, new CachedUser(userDetails, now + CACHE_TTL_MS));
        return userDetails;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.isBlank()) {
            throw new UsernameNotFoundException("Identifier cannot be blank");
        }
        String cleanId = identifier.trim();
        long now = System.currentTimeMillis();
        CachedUser cached = userCache.get(cleanId);
        if (cached != null && cached.expiresAt() > now) {
            return cached.userDetails();
        }

        java.util.Optional<User> userOpt = userRepository.findByEmail(cleanId.toLowerCase())
                .or(() -> userRepository.findByPhone(cleanId));

        // If not found and identifier is a UUID
        if (userOpt.isEmpty()) {
            try {
                java.util.UUID uuid = java.util.UUID.fromString(cleanId);
                userOpt = userRepository.findById(uuid);
            } catch (IllegalArgumentException ignored) {}
        }

        // If not found and identifier is a phone-based placeholder email (e.g., "9876543210@vendor.grabrentals.in")
        if (userOpt.isEmpty() && cleanId.contains("@")) {
            String prefixDigits = cleanId.substring(0, cleanId.indexOf("@")).replaceAll("[^0-9]", "");
            if (prefixDigits.length() >= 10) {
                userOpt = userRepository.findByPhone(prefixDigits)
                        .or(() -> userRepository.findByPhone("+91" + prefixDigits))
                        .or(() -> userRepository.findByPhone("+91 " + prefixDigits));
            }
        }

        User user = userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        UserDetails userDetails = CustomUserDetails.build(user);
        userCache.put(cleanId, new CachedUser(userDetails, now + CACHE_TTL_MS));
        return userDetails;
    }

    public void evictUser(String identifier) {
        if (identifier != null) {
            userCache.remove(identifier);
            userCache.remove(identifier.trim().toLowerCase());
        }
    }
}

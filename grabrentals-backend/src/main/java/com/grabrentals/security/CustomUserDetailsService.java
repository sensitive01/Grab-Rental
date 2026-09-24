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

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        long now = System.currentTimeMillis();
        CachedUser cached = userCache.get(identifier);
        if (cached != null && cached.expiresAt() > now) {
            return cached.userDetails();
        }

        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        UserDetails userDetails = CustomUserDetails.build(user);
        userCache.put(identifier, new CachedUser(userDetails, now + CACHE_TTL_MS));
        return userDetails;
    }

    public void evictUser(String identifier) {
        if (identifier != null) {
            userCache.remove(identifier);
        }
    }
}

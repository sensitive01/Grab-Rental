package com.grabrentals.searchhistory.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.searchhistory.dto.RecordSearchRequest;
import com.grabrentals.searchhistory.dto.SearchHistoryResponseDto;
import com.grabrentals.searchhistory.dto.SearchHistoryStatsDto;
import com.grabrentals.searchhistory.entity.SearchHistory;
import com.grabrentals.searchhistory.repository.SearchHistoryRepository;
import com.grabrentals.user.entity.User;
import com.grabrentals.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchHistoryServiceImpl implements SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SearchHistoryResponseDto recordSearch(RecordSearchRequest request, HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        String userAgent = httpRequest != null ? httpRequest.getHeader("User-Agent") : null;

        String resolvedUserId = request.getUserId();
        String resolvedName = request.getUserName();
        String resolvedEmail = request.getUserEmail();
        String resolvedPhone = request.getUserPhone();
        String resolvedRole = request.getUserRole() != null ? request.getUserRole() : "GUEST";

        // If authenticated in context but not provided in request, fill from auth user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String principalUsername = auth.getName();
            Optional<User> authUser = userRepository.findByEmail(principalUsername)
                    .or(() -> userRepository.findByPhone(principalUsername));
            if (authUser.isPresent()) {
                User u = authUser.get();
                resolvedUserId = u.getId() != null ? u.getId().toString() : null;
                resolvedName = (resolvedName != null && !resolvedName.isBlank()) ? resolvedName : u.getName();
                resolvedEmail = (resolvedEmail != null && !resolvedEmail.isBlank()) ? resolvedEmail : u.getEmail();
                resolvedPhone = (resolvedPhone != null && !resolvedPhone.isBlank()) ? resolvedPhone : u.getPhone();
                resolvedRole = u.getRole() != null ? u.getRole().name() : "CUSTOMER";
            }
        }

        if (resolvedUserId != null && "GUEST".equalsIgnoreCase(resolvedRole)) {
            resolvedRole = "CUSTOMER";
        }

        SearchHistory entity = SearchHistory.builder()
                .serviceType(request.getServiceType() != null ? request.getServiceType().toUpperCase() : "OUTSTATION")
                .tripType(request.getTripType())
                .pickupLocation(request.getPickupLocation())
                .dropLocation(request.getDropLocation())
                .pickupCity(request.getPickupCity())
                .pickupState(request.getPickupState())
                .dropCity(request.getDropCity())
                .dropState(request.getDropState())
                .stops(request.getStops())
                .pickupCoords(request.getPickupCoords())
                .dropCoords(request.getDropCoords())
                .pickupDate(request.getPickupDate())
                .pickupTime(request.getPickupTime())
                .returnDate(request.getReturnDate())
                .packageHoursKm(request.getPackageHoursKm())
                .distanceKm(request.getDistanceKm())
                .durationText(request.getDurationText())
                .tollPrice(request.getTollPrice())
                .userId(resolvedUserId)
                .userName(resolvedName)
                .userEmail(resolvedEmail)
                .userPhone(resolvedPhone)
                .userRole(resolvedRole)
                .sessionId(request.getSessionId())
                .ipAddress(clientIp)
                .userAgent(userAgent)
                .sourcePage(request.getSourcePage())
                .build();

        SearchHistory saved = searchHistoryRepository.save(entity);
        log.info("Saved search history #{} for {} -> {} by {} ({})",
                saved.getId(), saved.getPickupLocation(), saved.getDropLocation(),
                saved.getUserName() != null ? saved.getUserName() : "Guest", saved.getUserRole());

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SearchHistoryResponseDto> getSearchHistory(
            String serviceType,
            String search,
            String startDateStr,
            String endDateStr,
            Pageable pageable
    ) {
        LocalDateTime start = parseDateTime(startDateStr, true);
        LocalDateTime end = parseDateTime(endDateStr, false);

        Specification<SearchHistory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (serviceType != null && !serviceType.isBlank() && !serviceType.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.upper(root.get("serviceType")), serviceType.trim().toUpperCase()));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("pickupLocation")), pattern),
                        cb.like(cb.lower(root.get("dropLocation")), pattern),
                        cb.like(cb.lower(root.get("pickupCity")), pattern),
                        cb.like(cb.lower(root.get("dropCity")), pattern),
                        cb.like(cb.lower(root.get("userName")), pattern),
                        cb.like(cb.lower(root.get("userPhone")), pattern),
                        cb.like(cb.lower(root.get("userEmail")), pattern)
                ));
            }

            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }

            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return searchHistoryRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public SearchHistoryStatsDto getSearchHistoryStats() {
        long total = searchHistoryRepository.count();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();

        long todayCount = searchHistoryRepository.countByCreatedAtAfter(todayStart);
        long weekCount = searchHistoryRepository.countByCreatedAtAfter(weekStart);
        long registeredCount = searchHistoryRepository.countByUserIdIsNotNull();
        long guestCount = searchHistoryRepository.countByUserIdIsNull();

        Map<String, Long> serviceCounts = new HashMap<>();
        List<Object[]> grouped = searchHistoryRepository.countByServiceTypeGrouped();
        for (Object[] row : grouped) {
            String type = (String) row[0];
            Long count = (Long) row[1];
            serviceCounts.put(type != null ? type : "OTHER", count != null ? count : 0L);
        }

        List<Map<String, Object>> topRoutesList = new ArrayList<>();
        List<Object[]> topRoutesRaw = searchHistoryRepository.findTopRoutes(PageRequest.of(0, 5));
        for (Object[] row : topRoutesRaw) {
            Map<String, Object> r = new HashMap<>();
            r.put("pickup", row[0]);
            r.put("drop", row[1]);
            r.put("count", row[2]);
            topRoutesList.add(r);
        }

        return SearchHistoryStatsDto.builder()
                .totalSearches(total)
                .searchesToday(todayCount)
                .searchesThisWeek(weekCount)
                .registeredUserSearches(registeredCount)
                .guestSearches(guestCount)
                .searchesByService(serviceCounts)
                .topRoutes(topRoutesList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SearchHistoryResponseDto getSearchHistoryById(Long id) {
        SearchHistory entity = searchHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Search history not found with id: " + id));
        return mapToDto(entity);
    }

    @Override
    @Transactional
    public void deleteSearchHistory(Long id) {
        if (!searchHistoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Search history not found with id: " + id);
        }
        searchHistoryRepository.deleteById(id);
    }

    private SearchHistoryResponseDto mapToDto(SearchHistory s) {
        return SearchHistoryResponseDto.builder()
                .id(s.getId())
                .serviceType(s.getServiceType())
                .tripType(s.getTripType())
                .pickupLocation(s.getPickupLocation())
                .dropLocation(s.getDropLocation())
                .pickupCity(s.getPickupCity())
                .pickupState(s.getPickupState())
                .dropCity(s.getDropCity())
                .dropState(s.getDropState())
                .stops(s.getStops())
                .pickupCoords(s.getPickupCoords())
                .dropCoords(s.getDropCoords())
                .pickupDate(s.getPickupDate())
                .pickupTime(s.getPickupTime())
                .returnDate(s.getReturnDate())
                .packageHoursKm(s.getPackageHoursKm())
                .distanceKm(s.getDistanceKm())
                .durationText(s.getDurationText())
                .tollPrice(s.getTollPrice())
                .userId(s.getUserId())
                .userName(s.getUserName())
                .userEmail(s.getUserEmail())
                .userPhone(s.getUserPhone())
                .userRole(s.getUserRole())
                .sessionId(s.getSessionId())
                .ipAddress(s.getIpAddress())
                .userAgent(s.getUserAgent())
                .sourcePage(s.getSourcePage())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toInstant(ZoneOffset.UTC) : null)
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank() && !"unknown".equalsIgnoreCase(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private LocalDateTime parseDateTime(String dateStr, boolean isStart) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            LocalDate d = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return isStart ? d.atStartOfDay() : d.atTime(LocalTime.MAX);
        } catch (Exception e) {
            return null;
        }
    }
}

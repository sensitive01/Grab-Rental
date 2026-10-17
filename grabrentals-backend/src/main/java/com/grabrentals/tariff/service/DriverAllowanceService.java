package com.grabrentals.tariff.service;

import com.grabrentals.tariff.entity.DriverAllowance;
import com.grabrentals.tariff.repository.DriverAllowanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverAllowanceService {

    private final DriverAllowanceRepository repository;

    @Transactional(readOnly = true)
    public List<DriverAllowance> getAllAllowances() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public DriverAllowance getAllowanceById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public DriverAllowance createAllowance(DriverAllowance allowance) {
        if (allowance.getModelName() == null || allowance.getModelName().isBlank()) {
            allowance.setModelName("ALL");
        }
        if (allowance.getState() == null || allowance.getState().isBlank()) {
            allowance.setState("ALL");
        }
        if (allowance.getCity() == null || allowance.getCity().isBlank()) {
            allowance.setCity("ALL");
        }
        if (allowance.getShiftType() == null || allowance.getShiftType().isBlank()) {
            allowance.setShiftType("ALL");
        } else {
            allowance.setShiftType(allowance.getShiftType().toUpperCase(Locale.ROOT));
        }
        if (allowance.getAllowanceType() == null || allowance.getAllowanceType().isBlank()) {
            allowance.setAllowanceType("FLAT");
        } else {
            allowance.setAllowanceType(allowance.getAllowanceType().toUpperCase(Locale.ROOT));
        }
        if (allowance.getAllowanceValue() == null) {
            allowance.setAllowanceValue(BigDecimal.ZERO);
        }
        if (allowance.getActive() == null) {
            allowance.setActive(true);
        }
        return repository.save(allowance);
    }

    @Transactional
    public DriverAllowance updateAllowance(UUID id, DriverAllowance updated) {
        DriverAllowance existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver allowance rule not found with ID: " + id));

        if (updated.getModelName() != null && !updated.getModelName().isBlank()) {
            existing.setModelName(updated.getModelName().trim());
        }
        if (updated.getState() != null && !updated.getState().isBlank()) {
            existing.setState(updated.getState().trim());
        }
        if (updated.getCity() != null && !updated.getCity().isBlank()) {
            existing.setCity(updated.getCity().trim());
        }
        if (updated.getShiftType() != null && !updated.getShiftType().isBlank()) {
            existing.setShiftType(updated.getShiftType().trim().toUpperCase(Locale.ROOT));
        }
        if (updated.getAllowanceType() != null && !updated.getAllowanceType().isBlank()) {
            existing.setAllowanceType(updated.getAllowanceType().trim().toUpperCase(Locale.ROOT));
        }
        if (updated.getAllowanceValue() != null) {
            existing.setAllowanceValue(updated.getAllowanceValue());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }
        if (updated.getActive() != null) {
            existing.setActive(updated.getActive());
        }
        return repository.save(existing);
    }

    @Transactional
    public void deleteAllowance(UUID id) {
        repository.deleteById(id);
    }

    @Transactional
    public DriverAllowance toggleStatus(UUID id) {
        DriverAllowance existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver allowance rule not found with ID: " + id));
        existing.setActive(!Boolean.TRUE.equals(existing.getActive()));
        return repository.save(existing);
    }

    /**
     * Resolves the best matching Driver Allowance rule for a trip.
     * Returns null if no active rules match.
     */
    @Transactional(readOnly = true)
    public DriverAllowance resolveAllowance(String modelName, String city, String state, String pickupTime) {
        List<DriverAllowance> activeRules = repository.findAllActive();
        if (activeRules.isEmpty()) {
            return null;
        }

        String targetShift = determineShift(pickupTime);
        String targetModel = (modelName == null ? "" : modelName.trim().toLowerCase(Locale.ROOT));
        String targetCity = (city == null ? "" : city.trim().toLowerCase(Locale.ROOT));
        String targetState = (state == null ? "" : state.trim().toLowerCase(Locale.ROOT));

        return activeRules.stream()
                .map(rule -> new ScoredRule(rule, scoreMatch(rule, targetModel, targetCity, targetState, targetShift)))
                .filter(sr -> sr.score > 0)
                .max(Comparator.comparingInt(sr -> sr.score))
                .map(sr -> sr.rule)
                .orElse(null);
    }

    private String determineShift(String pickupTime) {
        if (pickupTime == null || pickupTime.isBlank()) {
            return "DAY";
        }
        try {
            String clean = pickupTime.trim();
            int hour = -1;
            if (clean.contains(":")) {
                hour = Integer.parseInt(clean.split(":")[0].trim());
            } else if (clean.matches("\\d+")) {
                hour = Integer.parseInt(clean);
            }
            if (hour >= 22 || (hour >= 0 && hour < 6)) {
                return "NIGHT";
            }
        } catch (Exception ignored) {
        }
        return "DAY";
    }

    private int scoreMatch(DriverAllowance rule, String targetModel, String targetCity, String targetState, String targetShift) {
        String ruleModel = (rule.getModelName() == null ? "all" : rule.getModelName().trim().toLowerCase(Locale.ROOT));
        String ruleCity = (rule.getCity() == null ? "all" : rule.getCity().trim().toLowerCase(Locale.ROOT));
        String ruleState = (rule.getState() == null ? "all" : rule.getState().trim().toLowerCase(Locale.ROOT));
        String ruleShift = (rule.getShiftType() == null ? "all" : rule.getShiftType().trim().toUpperCase(Locale.ROOT));

        int score = 0;

        // 1. Shift check
        if (ruleShift.equals("ALL") || ruleShift.equals("BOTH")) {
            score += 5;
        } else if (ruleShift.equals(targetShift)) {
            score += 15;
        } else {
            return -1; // Incompatible shift
        }

        // 2. Model check
        if (ruleModel.equals("all")) {
            score += 5;
        } else if (!targetModel.isEmpty() && (targetModel.equals(ruleModel) || targetModel.contains(ruleModel) || ruleModel.contains(targetModel))) {
            score += 100;
        } else if (!targetModel.isEmpty()) {
            return -1; // Specific model mismatch
        }

        // 3. City check
        if (ruleCity.equals("all")) {
            score += 5;
        } else if (!targetCity.isEmpty() && (targetCity.equals(ruleCity) || targetCity.contains(ruleCity) || ruleCity.contains(targetCity))) {
            score += 50;
        } else if (!targetCity.isEmpty()) {
            return -1; // Specific city mismatch
        }

        // 4. State check
        if (ruleState.equals("all")) {
            score += 2;
        } else if (!targetState.isEmpty() && (targetState.equals(ruleState) || targetState.contains(ruleState) || ruleState.contains(targetState))) {
            score += 20;
        }

        return score;
    }

    private static class ScoredRule {
        final DriverAllowance rule;
        final int score;

        ScoredRule(DriverAllowance rule, int score) {
            this.rule = rule;
            this.score = score;
        }
    }
}

package com.grabrentals.audit.service;

import com.grabrentals.audit.dto.AuditLogResponse;
import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.entity.AuditLog;
import com.grabrentals.audit.repository.AuditLogRepository;
import com.grabrentals.common.response.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogs(String category) {
        List<AuditLog> logs;
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            if (category.equalsIgnoreCase("ACTIVITY")) {
                logs = auditLogRepository.findByCategoryNotIgnoreCaseOrderByCreatedAtDesc("SECURITY");
            } else {
                logs = auditLogRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category.trim());
            }
        } else {
            logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        }
        return logs.stream().map(AuditLogResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsPaginated(
            String category,
            String status,
            String event,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = (size > 0 && size <= 100) ? size : 10;

        String sortField = resolveSortProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortField));

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
                if (category.equalsIgnoreCase("ACTIVITY")) {
                    predicates.add(cb.notEqual(cb.lower(root.get("category")), "security"));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
                }
            }

            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (event != null && !event.isBlank() && !event.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.lower(root.get("event")), event.trim().toLowerCase()));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("userName")), pattern),
                        cb.like(cb.lower(root.get("userId")), pattern),
                        cb.like(cb.lower(root.get("ipAddress")), pattern),
                        cb.like(cb.lower(root.get("device")), pattern),
                        cb.like(cb.lower(root.get("details")), pattern),
                        cb.like(cb.lower(root.get("module")), pattern),
                        cb.like(cb.lower(root.get("targetEntity")), pattern),
                        cb.like(cb.lower(root.get("event")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> auditLogPage = auditLogRepository.findAll(spec, pageable);
        Page<AuditLogResponse> responsePage = auditLogPage.map(AuditLogResponse::fromEntity);
        return PageResponse.of(responsePage);
    }

    private String resolveSortProperty(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy.toLowerCase().trim()) {
            case "event", "action", "actioncode" -> "event";
            case "username", "operatorname" -> "userName";
            case "userid", "operatorid" -> "userId";
            case "userrole", "operatorrole" -> "userRole";
            case "ipaddress" -> "ipAddress";
            case "device" -> "device";
            case "status" -> "status";
            case "details" -> "details";
            case "module" -> "module";
            case "targetentity" -> "targetEntity";
            default -> "createdAt";
        };
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public AuditLogResponse logEvent(CreateAuditLogRequest request) {
        if (request == null) return null;
        try {
            String category = request.getCategory() != null ? request.getCategory().toUpperCase().trim() : "ACTIVITY";
            String event = request.getEvent() != null ? request.getEvent().toUpperCase().trim() : "ACTION";

            AuditLog auditLog = AuditLog.builder()
                    .category(category)
                    .event(event)
                    .userId(request.getUserId())
                    .userName(request.getUserName())
                    .userRole(request.getUserRole())
                    .module(request.getModule())
                    .targetEntity(request.getTargetEntity())
                    .ipAddress(request.getIpAddress() != null ? request.getIpAddress() : "127.0.0.1")
                    .device(request.getDevice() != null ? request.getDevice() : "Web Client")
                    .status(request.getStatus() != null ? request.getStatus().toUpperCase().trim() : "SUCCESS")
                    .details(request.getDetails())
                    .createdAt(Instant.now())
                    .build();

            AuditLog saved = auditLogRepository.save(auditLog);
            log.info("[AUDIT] Logged {} event: {} for user: {}", saved.getCategory(), saved.getEvent(), saved.getUserId());
            return AuditLogResponse.fromEntity(saved);
        } catch (Throwable t) {
            log.warn("[AUDIT] Failed to save audit log: {}", t.getMessage());
            return null;
        }
    }
}

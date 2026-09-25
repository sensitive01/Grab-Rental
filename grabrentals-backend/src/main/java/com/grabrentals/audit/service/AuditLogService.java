package com.grabrentals.audit.service;

import com.grabrentals.audit.dto.AuditLogResponse;
import com.grabrentals.audit.dto.CreateAuditLogRequest;
import com.grabrentals.audit.entity.AuditLog;
import com.grabrentals.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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
            logs = auditLogRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category.trim());
        } else {
            logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        }
        return logs.stream().map(AuditLogResponse::fromEntity).toList();
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public AuditLogResponse logEvent(CreateAuditLogRequest request) {
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
    }
}

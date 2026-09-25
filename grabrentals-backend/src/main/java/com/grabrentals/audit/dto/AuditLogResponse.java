package com.grabrentals.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.grabrentals.audit.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {

    private UUID id;
    private String category;
    private String event;
    private String action; // alias for event
    private String actionCode; // alias for event
    private String userId;
    private String userName;
    private String userRole;
    private String operatorId; // alias for userId
    private String operatorName; // alias for userName
    private String operatorRole; // alias for userRole
    private String module;
    private String targetEntity;
    private String ipAddress;
    private String device;
    private String status;
    private String details;
    private String timestamp; // formatted "yyyy-MM-dd HH:mm:ss"
    private Instant createdAt;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.of("Asia/Kolkata"));

    public static AuditLogResponse fromEntity(AuditLog log) {
        if (log == null) return null;
        String formattedTime = log.getCreatedAt() != null ? FORMATTER.format(log.getCreatedAt()) : "";

        return AuditLogResponse.builder()
                .id(log.getId())
                .category(log.getCategory())
                .event(log.getEvent())
                .action(log.getEvent())
                .actionCode(log.getEvent())
                .userId(log.getUserId())
                .userName(log.getUserName())
                .userRole(log.getUserRole())
                .operatorId(log.getUserId())
                .operatorName(log.getUserName())
                .operatorRole(log.getUserRole())
                .module(log.getModule())
                .targetEntity(log.getTargetEntity())
                .ipAddress(log.getIpAddress())
                .device(log.getDevice())
                .status(log.getStatus() != null ? log.getStatus() : "SUCCESS")
                .details(log.getDetails())
                .timestamp(formattedTime)
                .createdAt(log.getCreatedAt())
                .build();
    }
}

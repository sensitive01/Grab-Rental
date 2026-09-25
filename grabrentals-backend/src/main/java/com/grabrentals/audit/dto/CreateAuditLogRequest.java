package com.grabrentals.audit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuditLogRequest {

    @NotBlank(message = "Category is required")
    private String category; // "SECURITY" or "ACTIVITY"

    @NotBlank(message = "Event/Action is required")
    private String event;

    private String userId;
    private String userName;
    private String userRole;
    private String module;
    private String targetEntity;
    private String ipAddress;
    private String device;
    private String status;
    private String details;
}

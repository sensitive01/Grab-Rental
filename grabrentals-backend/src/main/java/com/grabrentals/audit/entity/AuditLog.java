package com.grabrentals.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_logs_category", columnList = "category"),
        @Index(name = "idx_audit_logs_event", columnList = "event"),
        @Index(name = "idx_audit_logs_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_logs_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "category", nullable = false, length = 50)
    private String category; // "SECURITY" or "ACTIVITY"

    @Column(name = "event", nullable = false, length = 100)
    private String event; // e.g. "LOGIN_SUCCESS", "UPDATE_PRICING", "USER_PROVISIONED"

    @Column(name = "user_id", length = 255)
    private String userId; // email or identifier

    @Column(name = "user_name", length = 255)
    private String userName;

    @Column(name = "user_role", length = 50)
    private String userRole;

    @Column(name = "module", length = 100)
    private String module;

    @Column(name = "target_entity", length = 255)
    private String targetEntity;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "device", length = 255)
    private String device;

    @Column(name = "status", length = 50)
    private String status; // "SUCCESS", "FAILED", "WARNING"

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

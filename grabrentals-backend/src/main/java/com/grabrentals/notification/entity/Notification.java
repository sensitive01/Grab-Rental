package com.grabrentals.notification.entity;

import com.grabrentals.user.entity.Role;
import com.grabrentals.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_role", columnList = "recipient_role"),
        @Index(name = "idx_notifications_read", columnList = "is_read"),
        @Index(name = "idx_notifications_created", columnList = "created_at")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_role", nullable = false)
    private Role recipientRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id")
    private User recipientUser;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "urgency", nullable = false, length = 20)
    @Builder.Default
    private String urgency = "MEDIUM"; // HIGH, MEDIUM, INFO

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

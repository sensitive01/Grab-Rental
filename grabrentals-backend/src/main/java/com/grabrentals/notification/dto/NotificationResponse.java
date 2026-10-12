package com.grabrentals.notification.dto;

import com.grabrentals.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private String urgency;
    private String type;
    private String referenceId;
    private String linkUrl;
    private Boolean read;
    private Instant createdAt;
    private String timeAgo;

    public static NotificationResponse fromEntity(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .urgency(n.getUrgency())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .linkUrl(n.getLinkUrl())
                .read(n.getIsRead() != null ? n.getIsRead() : false)
                .createdAt(n.getCreatedAt())
                .timeAgo(formatTimeAgo(n.getCreatedAt()))
                .build();
    }

    private static String formatTimeAgo(Instant instant) {
        if (instant == null) return "Just now";
        long seconds = Duration.between(instant, Instant.now()).getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + (minutes == 1 ? " min ago" : " mins ago");
        long hours = minutes / 60;
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        long days = hours / 24;
        return days + (days == 1 ? " day ago" : " days ago");
    }
}

package com.grabrentals.notification.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.notification.dto.NotificationResponse;
import com.grabrentals.notification.service.NotificationService;
import com.grabrentals.user.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/operations/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OPERATIONS', 'ADMIN')")
public class OperationsNotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        log.info("[HTTP API] GET /api/operations/notifications");
        List<NotificationResponse> list = notificationService.getNotificationsForRole(Role.OPERATIONS);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount(Role.OPERATIONS);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable UUID id) {
        log.info("[HTTP API] PATCH /api/operations/notifications/{}/read", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "OK"));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllRead() {
        log.info("[HTTP API] POST /api/operations/notifications/mark-all-read");
        notificationService.markAllAsReadForRole(Role.OPERATIONS);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "OK"));
    }
}

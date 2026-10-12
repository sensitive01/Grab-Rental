package com.grabrentals.notification.service;

import com.grabrentals.common.exception.ResourceNotFoundException;
import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.repository.BookingRepository;
import com.grabrentals.notification.dto.NotificationResponse;
import com.grabrentals.notification.entity.Notification;
import com.grabrentals.notification.repository.NotificationRepository;
import com.grabrentals.user.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public Notification createNotification(
            Role recipientRole,
            String title,
            String message,
            String urgency,
            String type,
            String referenceId,
            String linkUrl
    ) {
        Notification notification = Notification.builder()
                .recipientRole(recipientRole)
                .title(title)
                .message(message)
                .urgency(urgency != null ? urgency : "MEDIUM")
                .type(type != null ? type : "ALERT")
                .referenceId(referenceId)
                .linkUrl(linkUrl)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("🔔 [NOTIFICATION CREATED] For {}: {} - {}", recipientRole, title, message);
        return saved;
    }

    @Transactional
    public List<NotificationResponse> getNotificationsForRole(Role role) {
        List<Notification> list = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role);
        if (list.isEmpty() && role == Role.OPERATIONS) {
            seedOperationsNotificationsFromLiveBookings();
            list = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role);
        }
        return list.stream().map(NotificationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Role role) {
        return notificationRepository.countByRecipientRoleAndIsReadFalse(role);
    }

    @Transactional
    public void markAsRead(UUID id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsReadForRole(Role role) {
        notificationRepository.markAllAsReadByRole(role);
    }

    private void seedOperationsNotificationsFromLiveBookings() {
        log.info("🌱 Seeding operations notifications from live database bookings...");
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        if (bookings.isEmpty()) {
            // Add initial welcome system notification
            createNotification(
                    Role.OPERATIONS,
                    "Dispatch Console Operational",
                    "Fleet & Trip Dispatch Console initialized. Real-time booking alerts will appear here.",
                    "INFO",
                    "SYSTEM_INIT",
                    null,
                    "/operations/dashboard"
            );
            return;
        }

        for (Booking b : bookings) {
            String ref = b.getBookingReference() != null ? b.getBookingReference() : b.getId().toString();
            String route = (b.getPickupCity() != null ? b.getPickupCity() : "Origin") + " to " +
                           (b.getDropCity() != null ? b.getDropCity() : "Destination");

            switch (b.getStatus()) {
                case PENDING_ALLOCATION -> createNotification(
                        Role.OPERATIONS,
                        "Fast Dispatch Alert",
                        "Booking #" + ref + " (" + route + ") requires vehicle allocation.",
                        "HIGH",
                        "ASSIGNMENT_NEEDED",
                        ref,
                        "/operations/assignments/vehicle?bookingId=" + ref
                );
                case ASSIGNED_TO_VENDOR -> createNotification(
                        Role.OPERATIONS,
                        "Partner Vendor Allocation Pending",
                        "Booking #" + ref + " routed to partner (" + (b.getVendor() != null ? b.getVendor().getName() : "Fleet Owner") + "). Awaiting chauffeur appointment.",
                        "MEDIUM",
                        "VENDOR_PENDING",
                        ref,
                        "/operations/bookings/" + ref
                );
                case CONFIRMED, ON_THE_WAY, IN_TRANSIT -> createNotification(
                        Role.OPERATIONS,
                        "Trip Active & In Transit",
                        "Booking #" + ref + " (" + route + ") is underway. Vehicle: " +
                                (b.getAssignedVehicle() != null ? b.getAssignedVehicle().getVehicleNumber() : "Assigned") + ".",
                        "INFO",
                        "TRIP_ACTIVE",
                        ref,
                        "/operations/trips/" + ref
                );
                case COMPLETED -> createNotification(
                        Role.OPERATIONS,
                        "Trip Duty Completed",
                        "Booking #" + ref + " (" + route + ") completed successfully.",
                        "INFO",
                        "TRIP_COMPLETED",
                        ref,
                        "/operations/bookings/" + ref
                );
                default -> {}
            }
        }
    }
}

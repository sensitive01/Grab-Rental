package com.grabrentals.searchhistory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_history", indexes = {
    @Index(name = "idx_search_history_created_at", columnList = "created_at"),
    @Index(name = "idx_search_history_service_type", columnList = "service_type"),
    @Index(name = "idx_search_history_user_id", columnList = "user_id"),
    @Index(name = "idx_search_history_phone", columnList = "user_phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Service Tab: OUTSTATION, LOCAL, AIRPORT, PACKAGE
     */
    @Column(name = "service_type", length = 50, nullable = false)
    private String serviceType;

    /**
     * Trip sub-type: round-trip, one-way, multicity, local, Airport Drop, Airport Pickup
     */
    @Column(name = "trip_type", length = 50)
    private String tripType;

    @Column(name = "pickup_location", columnDefinition = "TEXT", nullable = false)
    private String pickupLocation;

    @Column(name = "drop_location", columnDefinition = "TEXT")
    private String dropLocation;

    @Column(name = "pickup_city", length = 120)
    private String pickupCity;

    @Column(name = "pickup_state", length = 120)
    private String pickupState;

    @Column(name = "drop_city", length = 120)
    private String dropCity;

    @Column(name = "drop_state", length = 120)
    private String dropState;

    /**
     * Intermediate stops separated by pipe or comma
     */
    @Column(columnDefinition = "TEXT")
    private String stops;

    @Column(name = "pickup_coords", length = 100)
    private String pickupCoords;

    @Column(name = "drop_coords", length = 100)
    private String dropCoords;

    @Column(name = "pickup_date", length = 40)
    private String pickupDate;

    @Column(name = "pickup_time", length = 40)
    private String pickupTime;

    @Column(name = "return_date", length = 40)
    private String returnDate;

    /**
     * Local package descriptor e.g. "4hr-40km", "8hr-80km"
     */
    @Column(name = "package_hours_km", length = 80)
    private String packageHoursKm;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "duration_text", length = 80)
    private String durationText;

    @Column(name = "toll_price")
    private Double tollPrice;

    // === User & Identification Info ===
    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_phone", length = 40)
    private String userPhone;

    /**
     * CUSTOMER or GUEST
     */
    @Column(name = "user_role", length = 40)
    @Builder.Default
    private String userRole = "GUEST";

    @Column(name = "session_id", length = 120)
    private String sessionId;

    @Column(name = "ip_address", length = 60)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "source_page", length = 150)
    private String sourcePage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

package com.grabrentals.banner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "subtitle")
    private String subtitle;

    @Column(name = "media_url", columnDefinition = "TEXT", nullable = false)
    private String mediaUrl;

    /**
     * IMAGE, GIF, or VIDEO
     */
    @Column(name = "media_type", length = 32, nullable = false)
    @Builder.Default
    private String mediaType = "IMAGE";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "helpline_title")
    private String helplineTitle;

    @Column(name = "helpline_number")
    private String helplineNumber;

    /**
     * Target page where banner appears:
     * HOME, FLEET, OUTSTATION, LOCAL, AIRPORT, REVIEW_PAY, or ALL
     */
    @Column(name = "target_page", length = 64, nullable = false)
    @Builder.Default
    private String targetPage = "HOME";

    /**
     * POPUP or IN_PAGE
     */
    @Column(name = "display_type", length = 32, nullable = false)
    @Builder.Default
    private String displayType = "POPUP";

    /**
     * For POPUP type:
     * ON_LOAD, ON_SCROLL
     */
    @Column(name = "popup_trigger", length = 32)
    @Builder.Default
    private String popupTrigger = "ON_LOAD";

    /**
     * Delay in seconds before triggering popup (for ON_LOAD)
     */
    @Column(name = "trigger_delay_seconds")
    @Builder.Default
    private Integer triggerDelaySeconds = 3;

    /**
     * Scroll depth percentage before triggering popup (for ON_SCROLL)
     */
    @Column(name = "trigger_scroll_percent")
    @Builder.Default
    private Integer triggerScrollPercent = 30;

    /**
     * PERMANENT or TEMPORARY
     */
    @Column(name = "duration_type", length = 32, nullable = false)
    @Builder.Default
    private String durationType = "PERMANENT";

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    /**
     * Internal admin notes or terms & conditions
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

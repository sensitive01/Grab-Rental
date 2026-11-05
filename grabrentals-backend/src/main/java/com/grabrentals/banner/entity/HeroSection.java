package com.grabrentals.banner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hero_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique route key: HOME, AIRPORT, VANS, BUSES, EV_CABS, PET_FRIENDLY, PACKAGES, LOCAL, FLEET, CORPORATE
     */
    @Column(name = "page_key", length = 64, unique = true, nullable = false)
    private String pageKey;

    @Column(name = "page_name", length = 128, nullable = false)
    private String pageName;

    /**
     * Pill badge text (e.g. "⭐ GRAB RENTALS - INDIA'S FIRST ISO TRAVEL COMPANY")
     */
    @Column(name = "badge_text")
    private String badgeText;

    /**
     * Primary headline line 1 (white text)
     */
    @Column(name = "title_line1")
    private String titleLine1;

    /**
     * Highlight headline line 2 (accent colored text)
     */
    @Column(name = "title_line2")
    private String titleLine2;

    /**
     * Description / subtitle copy
     */
    @Column(columnDefinition = "TEXT")
    private String subtitle;

    /**
     * Primary background image URL
     */
    @Column(name = "bg_image_url", columnDefinition = "TEXT")
    private String bgImageUrl;

    /**
     * JSON array string of multiple background images for auto-scrolling carousel
     * e.g. ["https://res.cloudinary.com/.../img1.jpg", "https://res.cloudinary.com/.../img2.jpg"]
     */
    @Column(name = "bg_images", columnDefinition = "TEXT")
    private String bgImages;

    /**
     * Whether admin has added details for this page.
     * If false, customer site renders a clean white screen (no banner/picture fallback).
     */
    @Column(name = "has_details", nullable = false)
    @Builder.Default
    private Boolean hasDetails = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


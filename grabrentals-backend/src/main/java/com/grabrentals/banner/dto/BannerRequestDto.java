package com.grabrentals.banner.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerRequestDto {

    private String title;
    private String subtitle;
    private String mediaUrl;
    private String mediaType; // IMAGE, GIF, VIDEO
    private String description;
    private String helplineTitle;
    private String helplineNumber;
    private String targetPage; // HOME, FLEET, OUTSTATION, LOCAL, AIRPORT, REVIEW_PAY, ALL
    private String displayType; // POPUP, IN_PAGE
    private String popupTrigger; // ON_LOAD, ON_SCROLL
    private Integer triggerDelaySeconds;
    private Integer triggerScrollPercent;
    private String durationType; // PERMANENT, TEMPORARY
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private String notes;
    private Boolean active;
    private Integer sortOrder;
}

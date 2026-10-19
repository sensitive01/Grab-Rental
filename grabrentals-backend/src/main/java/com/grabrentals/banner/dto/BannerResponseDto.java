package com.grabrentals.banner.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponseDto {

    private Long id;
    private String title;
    private String subtitle;
    private String mediaUrl;
    private String mediaType;
    private String description;
    private String helplineTitle;
    private String helplineNumber;
    private String targetPage;
    private String displayType;
    private String popupTrigger;
    private Integer triggerDelaySeconds;
    private Integer triggerScrollPercent;
    private String durationType;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private String notes;
    private Boolean active;
    private Integer sortOrder;
    private Boolean isCurrentlyValid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.grabrentals.banner.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroSectionDto {
    private Long id;
    private String pageKey;
    private String pageName;
    private String badgeText;
    private String titleLine1;
    private String titleLine2;
    private String subtitle;
    private String bgImageUrl;
    private List<String> bgImages;
    private Boolean hasDetails;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


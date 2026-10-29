package com.grabrentals.searchhistory.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistoryResponseDto {

    private Long id;
    private String serviceType;
    private String tripType;

    private String pickupLocation;
    private String dropLocation;
    private String pickupCity;
    private String pickupState;
    private String dropCity;
    private String dropState;

    private String stops;
    private String pickupCoords;
    private String dropCoords;

    private String pickupDate;
    private String pickupTime;
    private String returnDate;
    private String packageHoursKm;

    private Double distanceKm;
    private String durationText;
    private Double tollPrice;

    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userRole;

    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private String sourcePage;

    private LocalDateTime createdAt;
}

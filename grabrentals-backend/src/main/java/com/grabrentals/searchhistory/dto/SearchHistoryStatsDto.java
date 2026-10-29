package com.grabrentals.searchhistory.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistoryStatsDto {
    private long totalSearches;
    private long searchesToday;
    private long searchesThisWeek;
    private long registeredUserSearches;
    private long guestSearches;
    private Map<String, Long> searchesByService;
    private List<Map<String, Object>> topRoutes;
}

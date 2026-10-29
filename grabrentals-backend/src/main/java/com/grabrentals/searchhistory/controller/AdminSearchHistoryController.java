package com.grabrentals.searchhistory.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.searchhistory.dto.SearchHistoryResponseDto;
import com.grabrentals.searchhistory.dto.SearchHistoryStatsDto;
import com.grabrentals.searchhistory.service.SearchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/search-history")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS')")
public class AdminSearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SearchHistoryResponseDto>>> getSearchHistory(
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SearchHistoryResponseDto> result = searchHistoryService.getSearchHistory(
                serviceType, search, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Search history fetched successfully", result));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<SearchHistoryStatsDto>> getSearchHistoryStats() {
        SearchHistoryStatsDto stats = searchHistoryService.getSearchHistoryStats();
        return ResponseEntity.ok(ApiResponse.success("Search history statistics retrieved", stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SearchHistoryResponseDto>> getSearchHistoryById(@PathVariable Long id) {
        SearchHistoryResponseDto dto = searchHistoryService.getSearchHistoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Search history retrieved", dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSearchHistory(@PathVariable Long id) {
        searchHistoryService.deleteSearchHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Search history entry deleted successfully"));
    }
}

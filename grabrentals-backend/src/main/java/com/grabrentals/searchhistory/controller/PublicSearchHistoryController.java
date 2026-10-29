package com.grabrentals.searchhistory.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.searchhistory.dto.RecordSearchRequest;
import com.grabrentals.searchhistory.dto.SearchHistoryResponseDto;
import com.grabrentals.searchhistory.service.SearchHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class PublicSearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<SearchHistoryResponseDto>> recordSearch(
            @Valid @RequestBody RecordSearchRequest request,
            HttpServletRequest httpRequest
    ) {
        SearchHistoryResponseDto result = searchHistoryService.recordSearch(request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Search inquiry recorded successfully", result));
    }
}

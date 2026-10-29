package com.grabrentals.searchhistory.service;

import com.grabrentals.searchhistory.dto.RecordSearchRequest;
import com.grabrentals.searchhistory.dto.SearchHistoryResponseDto;
import com.grabrentals.searchhistory.dto.SearchHistoryStatsDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchHistoryService {

    SearchHistoryResponseDto recordSearch(RecordSearchRequest request, HttpServletRequest httpRequest);

    Page<SearchHistoryResponseDto> getSearchHistory(
            String serviceType,
            String search,
            String startDateStr,
            String endDateStr,
            Pageable pageable
    );

    SearchHistoryStatsDto getSearchHistoryStats();

    SearchHistoryResponseDto getSearchHistoryById(Long id);

    void deleteSearchHistory(Long id);
}

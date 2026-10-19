package com.grabrentals.banner.controller;

import com.grabrentals.banner.dto.BannerResponseDto;
import com.grabrentals.banner.service.BannerService;
import com.grabrentals.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class PublicBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponseDto>>> getActiveBanners(
            @RequestParam(value = "page", required = false, defaultValue = "HOME") String page,
            @RequestParam(value = "displayType", required = false) String displayType
    ) {
        List<BannerResponseDto> banners = bannerService.getActiveBanners(page, displayType);
        return ResponseEntity.ok(ApiResponse.success("Active banners retrieved successfully", banners));
    }
}

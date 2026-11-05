package com.grabrentals.banner.controller;

import com.grabrentals.banner.dto.BannerResponseDto;
import com.grabrentals.banner.dto.HeroSectionDto;
import com.grabrentals.banner.service.BannerService;
import com.grabrentals.banner.service.HeroSectionService;
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
    private final HeroSectionService heroSectionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponseDto>>> getActiveBanners(
            @RequestParam(value = "page", required = false, defaultValue = "HOME") String page,
            @RequestParam(value = "displayType", required = false) String displayType
    ) {
        List<BannerResponseDto> banners = bannerService.getActiveBanners(page, displayType);
        return ResponseEntity.ok(ApiResponse.success("Active banners retrieved successfully", banners));
    }

    @GetMapping("/hero")
    public ResponseEntity<ApiResponse<List<HeroSectionDto>>> getAllHeroSections() {
        List<HeroSectionDto> sections = heroSectionService.getAllHeroSections();
        return ResponseEntity.ok(ApiResponse.success("Hero sections retrieved successfully", sections));
    }

    @GetMapping("/hero/{pageKey}")
    public ResponseEntity<ApiResponse<HeroSectionDto>> getHeroSectionByPageKey(@PathVariable String pageKey) {
        HeroSectionDto section = heroSectionService.getHeroSectionByPageKey(pageKey);
        return ResponseEntity.ok(ApiResponse.success("Hero section retrieved successfully", section));
    }
}

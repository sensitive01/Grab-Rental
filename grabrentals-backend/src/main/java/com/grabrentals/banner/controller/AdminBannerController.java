package com.grabrentals.banner.controller;

import com.grabrentals.banner.dto.BannerRequestDto;
import com.grabrentals.banner.dto.BannerResponseDto;
import com.grabrentals.banner.service.BannerService;
import com.grabrentals.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponseDto>>> getAllBanners() {
        List<BannerResponseDto> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponseDto>> getBannerById(@PathVariable Long id) {
        BannerResponseDto banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success("Banner retrieved successfully", banner));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponseDto>> createBanner(@RequestBody BannerRequestDto request) {
        BannerResponseDto created = bannerService.createBanner(request);
        return ResponseEntity.ok(ApiResponse.success("Banner created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponseDto>> updateBanner(
            @PathVariable Long id,
            @RequestBody BannerRequestDto request
    ) {
        BannerResponseDto updated = bannerService.updateBanner(id, request);
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<BannerResponseDto>> toggleActive(@PathVariable Long id) {
        BannerResponseDto toggled = bannerService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Banner status toggled", toggled));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", null));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(
            @RequestParam("file") MultipartFile file
    ) {
        Map<String, String> result = bannerService.uploadMedia(file);
        return ResponseEntity.ok(ApiResponse.success("Media uploaded successfully", result));
    }
}

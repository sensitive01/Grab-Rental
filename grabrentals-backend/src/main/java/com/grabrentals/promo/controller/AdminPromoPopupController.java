package com.grabrentals.promo.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.promo.dto.PromoPopupResponseDto;
import com.grabrentals.promo.dto.PromoPopupUpdateRequestDto;
import com.grabrentals.promo.service.PromoPopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/promo-popup")
@RequiredArgsConstructor
public class AdminPromoPopupController {

    private final PromoPopupService promoPopupService;

    @GetMapping
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> getPromoPopupConfig() {
        PromoPopupResponseDto config = promoPopupService.getConfig();
        return ResponseEntity.ok(ApiResponse.success("Promo popup configuration retrieved", config));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> uploadPromoImage(
            @RequestParam("file") MultipartFile file
    ) {
        PromoPopupResponseDto updated = promoPopupService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Promo image uploaded and saved successfully", updated));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> updatePromoPopup(
            @RequestBody PromoPopupUpdateRequestDto request
    ) {
        PromoPopupResponseDto updated = promoPopupService.updateConfig(request);
        return ResponseEntity.ok(ApiResponse.success("Promo popup configuration updated successfully", updated));
    }

    @PatchMapping("/toggle")
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> toggleStatus() {
        PromoPopupResponseDto toggled = promoPopupService.toggleActive();
        return ResponseEntity.ok(ApiResponse.success("Promo popup status toggled", toggled));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> resetToDefault() {
        PromoPopupResponseDto reset = promoPopupService.resetToDefault();
        return ResponseEntity.ok(ApiResponse.success("Promo popup image reset to default", reset));
    }
}

package com.grabrentals.promo.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.promo.dto.PromoPopupResponseDto;
import com.grabrentals.promo.service.PromoPopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promo-popup")
@RequiredArgsConstructor
public class PublicPromoPopupController {

    private final PromoPopupService promoPopupService;

    @GetMapping
    public ResponseEntity<ApiResponse<PromoPopupResponseDto>> getPublicPromoPopup() {
        PromoPopupResponseDto config = promoPopupService.getConfig();
        return ResponseEntity.ok(ApiResponse.success("Promo popup configuration retrieved", config));
    }
}

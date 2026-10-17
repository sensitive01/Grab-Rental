package com.grabrentals.payment.controller;

import com.grabrentals.common.response.ApiResponse;
import com.grabrentals.payment.dto.UpiConfigDto;
import com.grabrentals.payment.service.UpiConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upi")
@RequiredArgsConstructor
public class PublicUpiController {

    private final UpiConfigService upiConfigService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<UpiConfigDto>> getPublicConfig() {
        UpiConfigDto config = upiConfigService.getPublicConfig();
        return ResponseEntity.ok(ApiResponse.success("UPI payment configuration retrieved", config));
    }
}

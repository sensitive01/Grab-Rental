package com.grabrentals.payment.controller;

import com.grabrentals.vendor.service.CloudinaryService;
import com.grabrentals.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/upi")
@RequiredArgsConstructor
public class PaymentProofUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPaymentProof(
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Payment proof screenshot cannot be empty");
        }

        log.info("Uploading payment proof screenshot: name={}, size={} bytes", file.getOriginalFilename(), file.getSize());
        String secureUrl = cloudinaryService.uploadFile(file, "grabrentals/payment_proofs", null);
        log.info("Payment proof successfully stored at: {}", secureUrl);

        return ResponseEntity.ok(ApiResponse.success("Payment proof uploaded successfully", Map.of("url", secureUrl)));
    }
}

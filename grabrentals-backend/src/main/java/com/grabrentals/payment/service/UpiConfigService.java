package com.grabrentals.payment.service;

import com.grabrentals.payment.dto.UpiConfigDto;
import com.grabrentals.payment.entity.UpiConfig;
import com.grabrentals.payment.repository.UpiConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpiConfigService {

    private final UpiConfigRepository upiConfigRepository;

    @Transactional
    public UpiConfigDto getOrCreateConfig() {
        UpiConfig config = upiConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    log.info("No UPI configuration found. Seeding default UPI settings...");
                    UpiConfig defaultConfig = UpiConfig.builder()
                            .upiId("grabrentals@okaxis")
                            .payeeName("Grab Rentals India Pvt Ltd")
                            .bankName("Axis Bank")
                            .qrNote("Grab Rentals Advance Booking")
                            .instructions("1. Scan QR code using GPay, PhonePe, Paytm, or BHIM.\n2. Verify Payee Name shows 'Grab Rentals'.\n3. Complete the advance payment.\n4. Take a screenshot of the payment receipt and upload below along with the 12-digit UTR number.")
                            .active(true)
                            .build();
                    return upiConfigRepository.save(defaultConfig);
                });
        return UpiConfigDto.fromEntity(config);
    }

    @Transactional(readOnly = true)
    public UpiConfigDto getPublicConfig() {
        UpiConfig config = upiConfigRepository.findFirstByOrderByIdAsc()
                .orElse(null);
        if (config == null || !Boolean.TRUE.equals(config.getActive())) {
            // Return fallback default
            return UpiConfigDto.builder()
                    .upiId("grabrentals@okaxis")
                    .payeeName("Grab Rentals India")
                    .qrNote("Grab Rentals Booking Advance")
                    .active(true)
                    .build();
        }
        return UpiConfigDto.fromEntity(config);
    }

    @Transactional
    public UpiConfigDto updateConfig(UpiConfigDto request) {
        UpiConfig config = upiConfigRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> UpiConfig.builder().build());

        config.setUpiId(request.getUpiId().trim());
        config.setPayeeName(request.getPayeeName().trim());
        config.setBankName(request.getBankName() != null ? request.getBankName().trim() : null);
        config.setAccountNumber(request.getAccountNumber() != null ? request.getAccountNumber().trim() : null);
        config.setIfscCode(request.getIfscCode() != null ? request.getIfscCode().trim().toUpperCase() : null);
        config.setQrNote(request.getQrNote() != null ? request.getQrNote().trim() : "Grab Rentals Booking Advance");
        config.setInstructions(request.getInstructions());
        config.setActive(request.getActive() != null ? request.getActive() : true);

        UpiConfig saved = upiConfigRepository.save(config);
        log.info("Admin updated UPI config: upiId='{}', payee='{}', active={}", saved.getUpiId(), saved.getPayeeName(), saved.getActive());
        return UpiConfigDto.fromEntity(saved);
    }
}

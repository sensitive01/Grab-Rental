package com.grabrentals.promo.service;

import com.grabrentals.promo.dto.PromoPopupResponseDto;
import com.grabrentals.promo.dto.PromoPopupUpdateRequestDto;
import com.grabrentals.promo.entity.PromoPopupConfig;
import com.grabrentals.promo.repository.PromoPopupConfigRepository;
import com.grabrentals.vendor.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromoPopupService {

    public static final String DEFAULT_PROMO_IMAGE = "/images/promo/grab-welcome-poster-blue.jpg";

    private final PromoPopupConfigRepository configRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public PromoPopupConfig getOrCreateEntity() {
        return configRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    PromoPopupConfig initial = PromoPopupConfig.builder()
                            .imageUrl(DEFAULT_PROMO_IMAGE)
                            .active(true)
                            .build();
                    log.info("Initialized default promo popup configuration with default image.");
                    return configRepository.save(initial);
                });
    }

    @Transactional(readOnly = true)
    public PromoPopupResponseDto getConfig() {
        PromoPopupConfig config = configRepository.findFirstByOrderByIdAsc()
                .orElse(null);

        if (config == null) {
            return PromoPopupResponseDto.builder()
                    .id(1L)
                    .imageUrl(DEFAULT_PROMO_IMAGE)
                    .active(true)
                    .build();
        }

        return toDto(config);
    }

    @Transactional
    public PromoPopupResponseDto updateConfig(PromoPopupUpdateRequestDto request) {
        PromoPopupConfig config = getOrCreateEntity();

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            config.setImageUrl(request.getImageUrl().trim());
        }

        if (request.getActive() != null) {
            config.setActive(request.getActive());
        }

        PromoPopupConfig saved = configRepository.save(config);
        log.info("Updated promo popup config: active={}, imageUrl={}", saved.getActive(), saved.getImageUrl());
        return toDto(saved);
    }

    @Transactional
    public PromoPopupResponseDto uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        log.info("Uploading promo popup image: name={}, size={} bytes", file.getOriginalFilename(), file.getSize());
        String secureUrl = cloudinaryService.uploadFile(file, "grabrentals/promotions", null);

        PromoPopupConfig config = getOrCreateEntity();
        config.setImageUrl(secureUrl);
        config.setActive(true);
        PromoPopupConfig saved = configRepository.save(config);

        log.info("Successfully updated promo popup image to: {}", secureUrl);
        return toDto(saved);
    }

    @Transactional
    public PromoPopupResponseDto toggleActive() {
        PromoPopupConfig config = getOrCreateEntity();
        config.setActive(!Boolean.TRUE.equals(config.getActive()));
        PromoPopupConfig saved = configRepository.save(config);
        log.info("Toggled promo popup active state to: {}", saved.getActive());
        return toDto(saved);
    }

    @Transactional
    public PromoPopupResponseDto resetToDefault() {
        PromoPopupConfig config = getOrCreateEntity();
        config.setImageUrl(DEFAULT_PROMO_IMAGE);
        config.setActive(true);
        PromoPopupConfig saved = configRepository.save(config);
        log.info("Reset promo popup image to default poster.");
        return toDto(saved);
    }

    private PromoPopupResponseDto toDto(PromoPopupConfig entity) {
        return PromoPopupResponseDto.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl() != null && !entity.getImageUrl().isBlank()
                        ? entity.getImageUrl()
                        : DEFAULT_PROMO_IMAGE)
                .active(Boolean.TRUE.equals(entity.getActive()))
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt())
                .build();
    }
}

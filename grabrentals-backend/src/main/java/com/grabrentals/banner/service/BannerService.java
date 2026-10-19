package com.grabrentals.banner.service;

import com.grabrentals.banner.dto.BannerRequestDto;
import com.grabrentals.banner.dto.BannerResponseDto;
import com.grabrentals.banner.entity.Banner;
import com.grabrentals.banner.repository.BannerRepository;
import com.grabrentals.vendor.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<BannerResponseDto> getAllBanners() {
        return bannerRepository.findAllByOrderBySortOrderAscIdDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BannerResponseDto getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found with ID: " + id));
        return toDto(banner);
    }

    @Transactional(readOnly = true)
    public List<BannerResponseDto> getActiveBanners(String page, String displayType) {
        String queryPage = (page == null || page.isBlank()) ? "HOME" : page.trim().toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        List<Banner> list;
        if (displayType != null && !displayType.isBlank() && !"ALL".equalsIgnoreCase(displayType)) {
            list = bannerRepository.findActiveBannersForPageAndDisplayType(queryPage, displayType.trim().toUpperCase(), now);
        } else {
            list = bannerRepository.findActiveBannersForPage(queryPage, now);
        }

        return list.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BannerResponseDto createBanner(BannerRequestDto request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        if (request.getMediaUrl() == null || request.getMediaUrl().isBlank()) {
            throw new IllegalArgumentException("Media URL cannot be empty");
        }

        Banner banner = Banner.builder()
                .title(request.getTitle().trim())
                .subtitle(request.getSubtitle() != null && !request.getSubtitle().isBlank() ? request.getSubtitle().trim() : null)
                .mediaUrl(request.getMediaUrl().trim())
                .mediaType(normalizeMediaType(request.getMediaType(), request.getMediaUrl()))
                .description(request.getDescription())
                .helplineTitle(request.getHelplineTitle() != null && !request.getHelplineTitle().isBlank() ? request.getHelplineTitle().trim() : null)
                .helplineNumber(request.getHelplineNumber() != null && !request.getHelplineNumber().isBlank() ? request.getHelplineNumber().trim() : null)
                .targetPage(request.getTargetPage() != null && !request.getTargetPage().isBlank() ? request.getTargetPage().trim().toUpperCase() : "HOME")
                .displayType(request.getDisplayType() != null && !request.getDisplayType().isBlank() ? request.getDisplayType().trim().toUpperCase() : "POPUP")
                .popupTrigger(request.getPopupTrigger() != null && !request.getPopupTrigger().isBlank() ? request.getPopupTrigger().trim().toUpperCase() : "ON_LOAD")
                .triggerDelaySeconds(request.getTriggerDelaySeconds() != null ? request.getTriggerDelaySeconds() : 3)
                .triggerScrollPercent(request.getTriggerScrollPercent() != null ? request.getTriggerScrollPercent() : 30)
                .durationType(request.getDurationType() != null && !request.getDurationType().isBlank() ? request.getDurationType().trim().toUpperCase() : "PERMANENT")
                .startDate(request.getStartDate())
                .expiryDate(request.getExpiryDate())
                .notes(request.getNotes())
                .active(request.getActive() != null ? request.getActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        Banner saved = bannerRepository.save(banner);
        log.info("Created banner ID {} - {}", saved.getId(), saved.getTitle());
        return toDto(saved);
    }

    @Transactional
    public BannerResponseDto updateBanner(Long id, BannerRequestDto request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found with ID: " + id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            banner.setTitle(request.getTitle().trim());
        }
        if (request.getSubtitle() != null) {
            banner.setSubtitle(request.getSubtitle().isBlank() ? null : request.getSubtitle().trim());
        }
        if (request.getMediaUrl() != null && !request.getMediaUrl().isBlank()) {
            banner.setMediaUrl(request.getMediaUrl().trim());
        }
        if (request.getMediaType() != null && !request.getMediaType().isBlank()) {
            banner.setMediaType(normalizeMediaType(request.getMediaType(), banner.getMediaUrl()));
        }
        if (request.getDescription() != null) {
            banner.setDescription(request.getDescription());
        }
        if (request.getHelplineTitle() != null) {
            banner.setHelplineTitle(request.getHelplineTitle().isBlank() ? null : request.getHelplineTitle().trim());
        }
        if (request.getHelplineNumber() != null) {
            banner.setHelplineNumber(request.getHelplineNumber().isBlank() ? null : request.getHelplineNumber().trim());
        }
        if (request.getTargetPage() != null && !request.getTargetPage().isBlank()) {
            banner.setTargetPage(request.getTargetPage().trim().toUpperCase());
        }
        if (request.getDisplayType() != null && !request.getDisplayType().isBlank()) {
            banner.setDisplayType(request.getDisplayType().trim().toUpperCase());
        }
        if (request.getPopupTrigger() != null && !request.getPopupTrigger().isBlank()) {
            banner.setPopupTrigger(request.getPopupTrigger().trim().toUpperCase());
        }
        if (request.getTriggerDelaySeconds() != null) {
            banner.setTriggerDelaySeconds(request.getTriggerDelaySeconds());
        }
        if (request.getTriggerScrollPercent() != null) {
            banner.setTriggerScrollPercent(request.getTriggerScrollPercent());
        }
        if (request.getDurationType() != null && !request.getDurationType().isBlank()) {
            banner.setDurationType(request.getDurationType().trim().toUpperCase());
        }
        banner.setStartDate(request.getStartDate());
        banner.setExpiryDate(request.getExpiryDate());

        if (request.getNotes() != null) {
            banner.setNotes(request.getNotes());
        }
        if (request.getActive() != null) {
            banner.setActive(request.getActive());
        }
        if (request.getSortOrder() != null) {
            banner.setSortOrder(request.getSortOrder());
        }

        Banner updated = bannerRepository.save(banner);
        log.info("Updated banner ID {} - {}", updated.getId(), updated.getTitle());
        return toDto(updated);
    }

    @Transactional
    public BannerResponseDto toggleActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found with ID: " + id));
        banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
        Banner updated = bannerRepository.save(banner);
        log.info("Toggled active status for banner ID {} to {}", id, updated.getActive());
        return toDto(updated);
    }

    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new IllegalArgumentException("Banner not found with ID: " + id);
        }
        bannerRepository.deleteById(id);
        log.info("Deleted banner ID {}", id);
    }

    public Map<String, String> uploadMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Media file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        String mediaType = "IMAGE";
        if (contentType.startsWith("video/") || originalFilename.matches(".*\\.(mp4|webm|mov|avi|mkv)$")) {
            mediaType = "VIDEO";
        } else if (contentType.contains("gif") || originalFilename.endsWith(".gif")) {
            mediaType = "GIF";
        }

        log.info("Uploading banner media file: name={}, size={} bytes, detected type={}",
                file.getOriginalFilename(), file.getSize(), mediaType);

        String secureUrl = cloudinaryService.uploadFile(file, "grabrentals/banners", null);

        return Map.of(
                "url", secureUrl,
                "mediaType", mediaType
        );
    }

    private String normalizeMediaType(String providedType, String url) {
        if (providedType != null && !providedType.isBlank()) {
            String upper = providedType.trim().toUpperCase();
            if (upper.equals("VIDEO") || upper.equals("GIF") || upper.equals("IMAGE")) {
                return upper;
            }
        }
        if (url != null) {
            String lower = url.toLowerCase();
            if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) {
                return "VIDEO";
            }
            if (lower.endsWith(".gif")) {
                return "GIF";
            }
        }
        return "IMAGE";
    }

    private BannerResponseDto toDto(Banner entity) {
        LocalDateTime now = LocalDateTime.now();
        boolean validByDate = "PERMANENT".equalsIgnoreCase(entity.getDurationType()) ||
                ((entity.getStartDate() == null || !entity.getStartDate().isAfter(now)) &&
                 (entity.getExpiryDate() == null || !entity.getExpiryDate().isBefore(now)));

        boolean isCurrentlyValid = Boolean.TRUE.equals(entity.getActive()) && validByDate;

        return BannerResponseDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .subtitle(entity.getSubtitle())
                .mediaUrl(entity.getMediaUrl())
                .mediaType(entity.getMediaType() != null ? entity.getMediaType() : "IMAGE")
                .description(entity.getDescription())
                .helplineTitle(entity.getHelplineTitle())
                .helplineNumber(entity.getHelplineNumber())
                .targetPage(entity.getTargetPage() != null ? entity.getTargetPage() : "HOME")
                .displayType(entity.getDisplayType() != null ? entity.getDisplayType() : "POPUP")
                .popupTrigger(entity.getPopupTrigger() != null ? entity.getPopupTrigger() : "ON_LOAD")
                .triggerDelaySeconds(entity.getTriggerDelaySeconds() != null ? entity.getTriggerDelaySeconds() : 3)
                .triggerScrollPercent(entity.getTriggerScrollPercent() != null ? entity.getTriggerScrollPercent() : 30)
                .durationType(entity.getDurationType() != null ? entity.getDurationType() : "PERMANENT")
                .startDate(entity.getStartDate())
                .expiryDate(entity.getExpiryDate())
                .notes(entity.getNotes())
                .active(Boolean.TRUE.equals(entity.getActive()))
                .sortOrder(entity.getSortOrder() != null ? entity.getSortOrder() : 0)
                .isCurrentlyValid(isCurrentlyValid)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

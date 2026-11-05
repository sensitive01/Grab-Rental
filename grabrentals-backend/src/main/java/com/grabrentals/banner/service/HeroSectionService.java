package com.grabrentals.banner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grabrentals.banner.dto.HeroSectionDto;
import com.grabrentals.banner.entity.HeroSection;
import com.grabrentals.banner.repository.HeroSectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeroSectionService {

    private final HeroSectionRepository heroSectionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Seed initial 10 pages on application startup if not present.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialHeroSections() {
        if (heroSectionRepository.count() > 0) {
            return;
        }

        log.info("Seeding initial Hero Sections for 10 platform page routes...");

        List<HeroSection> initialList = List.of(
                HeroSection.builder().pageKey("HOME").pageName("Home Page").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("AIRPORT").pageName("Airport Transfers").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("VANS").pageName("Tempo Travellers & Vans").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("BUSES").pageName("Luxury Buses & Coaches").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("EV_CABS").pageName("⚡ EV Cabs").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("PET_FRIENDLY").pageName("🐶 Pet Friendly Cabs").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("PACKAGES").pageName("Tour & Roadtrip Packages").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("LOCAL").pageName("Local Hourly Rentals").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("FLEET").pageName("Fleet Vehicle Catalog").hasDetails(false).bgImages("[]").active(true).build(),
                HeroSection.builder().pageKey("CORPORATE").pageName("Corporate Mobility").hasDetails(false).bgImages("[]").active(true).build()
        );

        heroSectionRepository.saveAll(initialList);
        log.info("Successfully seeded 10 Hero Sections.");
    }

    @Transactional(readOnly = true)
    public List<HeroSectionDto> getAllHeroSections() {
        return heroSectionRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HeroSectionDto getHeroSectionByPageKey(String pageKey) {
        String cleanKey = (pageKey == null || pageKey.isBlank()) ? "HOME" : pageKey.trim().toUpperCase();
        HeroSection section = heroSectionRepository.findByPageKeyIgnoreCase(cleanKey)
                .orElseGet(() -> HeroSection.builder()
                        .pageKey(cleanKey)
                        .pageName(cleanKey)
                        .hasDetails(false)
                        .active(true)
                        .build());
        return toDto(section);
    }

    @Transactional
    public HeroSectionDto updateHeroSection(String pageKey, HeroSectionDto request) {
        String cleanKey = (pageKey == null || pageKey.isBlank()) ? "HOME" : pageKey.trim().toUpperCase();

        HeroSection entity = heroSectionRepository.findByPageKeyIgnoreCase(cleanKey)
                .orElseGet(() -> HeroSection.builder()
                        .pageKey(cleanKey)
                        .pageName(request.getPageName() != null ? request.getPageName() : cleanKey)
                        .build());

        if (request.getPageName() != null && !request.getPageName().isBlank()) {
            entity.setPageName(request.getPageName().trim());
        }

        entity.setBadgeText(request.getBadgeText() != null ? request.getBadgeText().trim() : null);
        entity.setTitleLine1(request.getTitleLine1() != null ? request.getTitleLine1().trim() : null);
        entity.setTitleLine2(request.getTitleLine2() != null ? request.getTitleLine2().trim() : null);
        entity.setSubtitle(request.getSubtitle() != null ? request.getSubtitle().trim() : null);

        // Normalize multiple images
        List<String> images = (request.getBgImages() != null) ? request.getBgImages() : new ArrayList<>();
        if (images.isEmpty() && request.getBgImageUrl() != null && !request.getBgImageUrl().isBlank()) {
            images = List.of(request.getBgImageUrl().trim());
        }

        try {
            entity.setBgImages(objectMapper.writeValueAsString(images));
        } catch (Exception e) {
            log.warn("Failed to serialize bgImages JSON: {}", e.getMessage());
            entity.setBgImages("[]");
        }

        if (!images.isEmpty()) {
            entity.setBgImageUrl(images.get(0));
        } else {
            entity.setBgImageUrl(null);
        }

        // Determine hasDetails: true if explicit, or if images or title provided and active
        boolean active = request.getActive() == null || Boolean.TRUE.equals(request.getActive());
        entity.setActive(active);

        boolean hasAnyContent = !images.isEmpty() ||
                (entity.getTitleLine1() != null && !entity.getTitleLine1().isBlank());

        if (Boolean.FALSE.equals(request.getHasDetails())) {
            entity.setHasDetails(false);
        } else {
            entity.setHasDetails(active && hasAnyContent);
        }

        HeroSection saved = heroSectionRepository.save(entity);
        log.info("Saved HeroSection for pageKey '{}', hasDetails={}", cleanKey, saved.getHasDetails());
        return toDto(saved);
    }

    @Transactional
    public HeroSectionDto clearHeroSection(String pageKey) {
        String cleanKey = (pageKey == null || pageKey.isBlank()) ? "HOME" : pageKey.trim().toUpperCase();

        HeroSection entity = heroSectionRepository.findByPageKeyIgnoreCase(cleanKey)
                .orElseGet(() -> HeroSection.builder()
                        .pageKey(cleanKey)
                        .pageName(cleanKey)
                        .build());

        entity.setHasDetails(false);
        entity.setBgImageUrl(null);
        entity.setBgImages("[]");
        entity.setBadgeText(null);
        entity.setTitleLine1(null);
        entity.setTitleLine2(null);
        entity.setSubtitle(null);

        HeroSection saved = heroSectionRepository.save(entity);
        log.info("Cleared HeroSection for pageKey '{}' (now displays white screen)", cleanKey);
        return toDto(saved);
    }

    private HeroSectionDto toDto(HeroSection entity) {
        List<String> imagesList = new ArrayList<>();
        if (entity.getBgImages() != null && !entity.getBgImages().isBlank()) {
            try {
                imagesList = objectMapper.readValue(entity.getBgImages(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.warn("Failed to deserialize bgImages for ID {}: {}", entity.getId(), e.getMessage());
            }
        }

        if (imagesList.isEmpty() && entity.getBgImageUrl() != null && !entity.getBgImageUrl().isBlank()) {
            imagesList.add(entity.getBgImageUrl());
        }

        return HeroSectionDto.builder()
                .id(entity.getId())
                .pageKey(entity.getPageKey())
                .pageName(entity.getPageName())
                .badgeText(entity.getBadgeText())
                .titleLine1(entity.getTitleLine1())
                .titleLine2(entity.getTitleLine2())
                .subtitle(entity.getSubtitle())
                .bgImageUrl(entity.getBgImageUrl())
                .bgImages(imagesList)
                .hasDetails(Boolean.TRUE.equals(entity.getHasDetails()) && Boolean.TRUE.equals(entity.getActive()))
                .active(Boolean.TRUE.equals(entity.getActive()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}


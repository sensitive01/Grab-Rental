package com.grabrentals.banner.repository;

import com.grabrentals.banner.entity.HeroSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HeroSectionRepository extends JpaRepository<HeroSection, Long> {

    Optional<HeroSection> findByPageKeyIgnoreCase(String pageKey);

    List<HeroSection> findAllByOrderByIdAsc();
}


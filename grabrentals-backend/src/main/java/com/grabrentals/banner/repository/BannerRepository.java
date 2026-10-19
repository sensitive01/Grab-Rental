package com.grabrentals.banner.repository;

import com.grabrentals.banner.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findAllByOrderBySortOrderAscIdDesc();

    @Query("SELECT b FROM Banner b WHERE b.active = true AND " +
            "(:page = 'ALL' OR b.targetPage = 'ALL' OR UPPER(b.targetPage) = UPPER(:page)) AND " +
            "(b.durationType = 'PERMANENT' OR " +
            " (b.durationType = 'TEMPORARY' AND (b.startDate IS NULL OR b.startDate <= :now) AND (b.expiryDate IS NULL OR b.expiryDate >= :now))) " +
            "ORDER BY b.sortOrder ASC, b.id DESC")
    List<Banner> findActiveBannersForPage(
            @Param("page") String page,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT b FROM Banner b WHERE b.active = true AND " +
            "(:page = 'ALL' OR b.targetPage = 'ALL' OR UPPER(b.targetPage) = UPPER(:page)) AND " +
            "(UPPER(b.displayType) = UPPER(:displayType)) AND " +
            "(b.durationType = 'PERMANENT' OR " +
            " (b.durationType = 'TEMPORARY' AND (b.startDate IS NULL OR b.startDate <= :now) AND (b.expiryDate IS NULL OR b.expiryDate >= :now))) " +
            "ORDER BY b.sortOrder ASC, b.id DESC")
    List<Banner> findActiveBannersForPageAndDisplayType(
            @Param("page") String page,
            @Param("displayType") String displayType,
            @Param("now") LocalDateTime now
    );
}

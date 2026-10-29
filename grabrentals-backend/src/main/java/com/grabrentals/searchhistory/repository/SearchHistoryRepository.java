package com.grabrentals.searchhistory.repository;

import com.grabrentals.searchhistory.entity.SearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long>, JpaSpecificationExecutor<SearchHistory> {

    long countByCreatedAtAfter(LocalDateTime timestamp);

    long countByUserIdIsNotNull();

    long countByUserIdIsNull();

    @Query("SELECT s.serviceType, COUNT(s) FROM SearchHistory s GROUP BY s.serviceType")
    List<Object[]> countByServiceTypeGrouped();

    @Query("""
        SELECT s.pickupLocation, s.dropLocation, COUNT(s)
        FROM SearchHistory s
        WHERE s.pickupLocation IS NOT NULL AND s.dropLocation IS NOT NULL AND s.dropLocation <> ''
        GROUP BY s.pickupLocation, s.dropLocation
        ORDER BY COUNT(s) DESC
    """)
    List<Object[]> findTopRoutes(Pageable pageable);
}

package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.AirportTariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AirportTariffRepository extends JpaRepository<AirportTariff, UUID> {

    List<AirportTariff> findAllByOrderByCreatedAtDesc();

    List<AirportTariff> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<AirportTariff> findByPricingTypeIgnoreCase(String pricingType);

    @Query("SELECT a FROM AirportTariff a WHERE LOWER(a.status) = 'active' " +
           "AND (:category IS NULL OR LOWER(a.category) = LOWER(:category)) " +
           "ORDER BY a.minKm ASC")
    List<AirportTariff> findActiveByCategory(@Param("category") String category);

    @Query("SELECT a FROM AirportTariff a WHERE LOWER(a.status) = 'active' " +
           "AND (:city IS NULL OR LOWER(a.city) = LOWER(:city) OR LOWER(a.city) = 'all') " +
           "ORDER BY a.minKm ASC")
    List<AirportTariff> findActiveByCity(@Param("city") String city);
}

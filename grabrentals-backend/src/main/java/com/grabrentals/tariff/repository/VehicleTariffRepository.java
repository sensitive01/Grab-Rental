package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.VehicleTariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleTariffRepository extends JpaRepository<VehicleTariff, UUID> {

    List<VehicleTariff> findBySeasonalFalse();

    List<VehicleTariff> findBySeasonalTrue();

    Optional<VehicleTariff> findFirstByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
            String category, String modelName, String seatingCapacity
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = true " +
           "AND :targetDate BETWEEN t.startDate AND t.endDate " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity")
    Optional<VehicleTariff> findSeasonalTariff(
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("targetDate") LocalDate targetDate
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = true " +
           "AND :targetDate BETWEEN t.startDate AND t.endDate " +
           "AND LOWER(t.category) = LOWER(:category)")
    List<VehicleTariff> findSeasonalTariffsForCategory(
            @Param("category") String category,
            @Param("targetDate") LocalDate targetDate
    );

    Optional<VehicleTariff> findFirstByCategoryIgnoreCaseAndSeasonalFalse(String category);
}

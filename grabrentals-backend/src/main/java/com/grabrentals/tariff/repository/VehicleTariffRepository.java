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

    List<VehicleTariff> findByServiceTypeIgnoreCase(String serviceType);

    Optional<VehicleTariff> findFirstByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
            String category, String modelName, String seatingCapacity
    );

    Optional<VehicleTariff> findFirstByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndFuelTypeIgnoreCaseAndSeasonalFalse(
            String category, String modelName, String seatingCapacity, String fuelType
    );

    Optional<VehicleTariff> findFirstByServiceTypeIgnoreCaseAndCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndSeasonalFalse(
            String serviceType, String category, String modelName, String seatingCapacity
    );

    Optional<VehicleTariff> findFirstByServiceTypeIgnoreCaseAndCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacityAndFuelTypeIgnoreCaseAndSeasonalFalse(
            String serviceType, String category, String modelName, String seatingCapacity, String fuelType
    );

    Optional<VehicleTariff> findFirstByServiceTypeIgnoreCaseAndCategoryIgnoreCaseAndSeasonalFalse(
            String serviceType, String category
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = true " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND :targetDate BETWEEN t.startDate AND t.endDate " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity")
    Optional<VehicleTariff> findSeasonalTariff(
            @Param("serviceType") String serviceType,
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

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND LOWER(t.city) = LOWER(:city)")
    Optional<VehicleTariff> findStandardByModelAndCity(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("city") String city
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.fuelType) = LOWER(:fuelType) OR (:fuelType = 'Diesel' AND t.fuelType IS NULL)) " +
           "AND LOWER(t.city) = LOWER(:city)")
    Optional<VehicleTariff> findStandardByModelAndCityAndFuel(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("fuelType") String fuelType,
            @Param("city") String city
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.city) = 'all' OR t.city IS NULL OR t.city = '') " +
           "AND LOWER(t.state) = LOWER(:state)")
    Optional<VehicleTariff> findStandardByModelAndState(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("state") String state
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.fuelType) = LOWER(:fuelType) OR (:fuelType = 'Diesel' AND t.fuelType IS NULL)) " +
           "AND (LOWER(t.city) = 'all' OR t.city IS NULL OR t.city = '') " +
           "AND LOWER(t.state) = LOWER(:state)")
    Optional<VehicleTariff> findStandardByModelAndStateAndFuel(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("fuelType") String fuelType,
            @Param("state") String state
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.fuelType) = LOWER(:fuelType) OR (:fuelType = 'Diesel' AND t.fuelType IS NULL)) " +
           "AND LOWER(t.city) = LOWER(:city) " +
           "AND (:packageHours IS NULL OR t.packageHours = :packageHours)")
    Optional<VehicleTariff> findStandardByModelAndCityAndFuelAndPackageHours(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("fuelType") String fuelType,
            @Param("city") String city,
            @Param("packageHours") Integer packageHours
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.fuelType) = LOWER(:fuelType) OR (:fuelType = 'Diesel' AND t.fuelType IS NULL)) " +
           "AND (LOWER(t.city) = 'all' OR t.city IS NULL OR t.city = '') " +
           "AND LOWER(t.state) = LOWER(:state) " +
           "AND (:packageHours IS NULL OR t.packageHours = :packageHours)")
    Optional<VehicleTariff> findStandardByModelAndStateAndFuelAndPackageHours(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("fuelType") String fuelType,
            @Param("state") String state,
            @Param("packageHours") Integer packageHours
    );

    @Query("SELECT t FROM VehicleTariff t WHERE t.seasonal = false " +
           "AND LOWER(t.serviceType) = LOWER(:serviceType) " +
           "AND LOWER(t.category) = LOWER(:category) " +
           "AND LOWER(t.modelName) = LOWER(:modelName) " +
           "AND t.seatingCapacity = :seatingCapacity " +
           "AND (LOWER(t.fuelType) = LOWER(:fuelType) OR (:fuelType = 'Diesel' AND t.fuelType IS NULL)) " +
           "AND (t.city IS NULL OR LOWER(t.city) = 'all' OR t.city = '') " +
           "AND (t.state IS NULL OR LOWER(t.state) = 'all' OR t.state = '') " +
           "AND (:packageHours IS NULL OR t.packageHours = :packageHours)")
    Optional<VehicleTariff> findStandardAllCitiesByModelAndFuelAndPackageHours(
            @Param("serviceType") String serviceType,
            @Param("category") String category,
            @Param("modelName") String modelName,
            @Param("seatingCapacity") String seatingCapacity,
            @Param("fuelType") String fuelType,
            @Param("packageHours") Integer packageHours
    );

    long countByServiceTypeIgnoreCase(String serviceType);

    @Query("SELECT COUNT(t) > 0 FROM VehicleTariff t WHERE " +
           "LOWER(t.serviceType) = LOWER(:serviceType) AND (" +
           "LOWER(t.city) = LOWER(:city) " +
           "OR ((LOWER(t.city) = 'all' OR t.city IS NULL OR t.city = '') AND LOWER(t.state) = LOWER(:state)))")
    boolean existsByServiceTypeAndCityOrState(
            @Param("serviceType") String serviceType,
            @Param("city") String city,
            @Param("state") String state
    );

    @Query("SELECT COUNT(t) > 0 FROM VehicleTariff t WHERE " +
           "LOWER(t.city) = LOWER(:city) " +
           "OR ((LOWER(t.city) = 'all' OR t.city IS NULL OR t.city = '') AND LOWER(t.state) = LOWER(:state))")
    boolean existsByCityOrState(@Param("city") String city, @Param("state") String state);

    @Query("SELECT COUNT(t) > 0 FROM VehicleTariff t WHERE LOWER(t.city) = LOWER(:city)")
    boolean existsByCityIgnoreCase(@Param("city") String city);
}

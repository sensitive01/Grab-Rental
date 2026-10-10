package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.VehicleModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleModelConfigRepository extends JpaRepository<VehicleModelConfig, UUID> {

    List<VehicleModelConfig> findByActiveTrue();

    List<VehicleModelConfig> findByCategoryIgnoreCase(String category);

    Optional<VehicleModelConfig> findByCategoryIgnoreCaseAndModelNameIgnoreCaseAndSeatingCapacity(
            String category, String modelName, String seatingCapacity
    );

    Optional<VehicleModelConfig> findFirstByCategoryIgnoreCaseAndModelNameIgnoreCase(
            String category, String modelName
    );

    Optional<VehicleModelConfig> findFirstByCategoryIgnoreCase(String category);
}

package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.VehicleCategoryPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleCategoryPresetRepository extends JpaRepository<VehicleCategoryPreset, UUID> {

    List<VehicleCategoryPreset> findAllByOrderByCategoryAscModelNameAsc();

    List<VehicleCategoryPreset> findByCategoryIgnoreCase(String category);

    Optional<VehicleCategoryPreset> findByCategoryIgnoreCaseAndModelNameIgnoreCase(String category, String modelName);

    boolean existsByCategoryIgnoreCaseAndModelNameIgnoreCase(String category, String modelName);

    void deleteByCategoryIgnoreCase(String category);

    void deleteByCategoryIgnoreCaseAndModelNameIgnoreCase(String category, String modelName);
}

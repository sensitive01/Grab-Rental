package com.grabrentals.vendor.repository;

import com.grabrentals.vendor.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    List<Driver> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Driver> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);

    long countByUserId(UUID userId);

    List<Driver> findByUserIdAndAssignedVehicleIsNotNull(UUID userId);

    Optional<Driver> findByAssignedVehicleId(UUID vehicleId);

    List<Driver> findByStatus(com.grabrentals.vendor.entity.DriverStatus status);
}

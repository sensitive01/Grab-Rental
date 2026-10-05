package com.grabrentals.vendor.repository;

import com.grabrentals.vendor.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Vehicle> findByIdAndUserId(UUID id, UUID userId);

    Optional<Vehicle> findByVehicleNumberIgnoreCase(String vehicleNumber);

    boolean existsByVehicleNumberIgnoreCase(String vehicleNumber);

    long countByUserId(UUID userId);

    List<Vehicle> findByStatus(com.grabrentals.vendor.entity.VehicleStatus status);
}

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

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v WHERE UPPER(REPLACE(REPLACE(v.vehicleNumber, ' ', ''), '-', '')) = UPPER(REPLACE(REPLACE(:vehicleNumber, ' ', ''), '-', ''))")
    Optional<Vehicle> findByNormalizedVehicleNumber(@org.springframework.data.repository.query.Param("vehicleNumber") String vehicleNumber);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) > 0 FROM Vehicle v WHERE UPPER(REPLACE(REPLACE(v.vehicleNumber, ' ', ''), '-', '')) = UPPER(REPLACE(REPLACE(:vehicleNumber, ' ', ''), '-', ''))")
    boolean existsByNormalizedVehicleNumber(@org.springframework.data.repository.query.Param("vehicleNumber") String vehicleNumber);

    long countByUserId(UUID userId);

    List<Vehicle> findByStatus(com.grabrentals.vendor.entity.VehicleStatus status);
}

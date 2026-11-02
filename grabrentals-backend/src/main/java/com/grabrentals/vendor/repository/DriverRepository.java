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

    Optional<Driver> findByLicenseNumberIgnoreCase(String licenseNumber);

    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Driver d WHERE UPPER(REPLACE(REPLACE(d.licenseNumber, ' ', ''), '-', '')) = UPPER(REPLACE(REPLACE(:licenseNumber, ' ', ''), '-', ''))")
    Optional<Driver> findByNormalizedLicenseNumber(@org.springframework.data.repository.query.Param("licenseNumber") String licenseNumber);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) > 0 FROM Driver d WHERE UPPER(REPLACE(REPLACE(d.licenseNumber, ' ', ''), '-', '')) = UPPER(REPLACE(REPLACE(:licenseNumber, ' ', ''), '-', ''))")
    boolean existsByNormalizedLicenseNumber(@org.springframework.data.repository.query.Param("licenseNumber") String licenseNumber);

    long countByUserId(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT d.user.id, COUNT(d) FROM Driver d GROUP BY d.user.id")
    List<Object[]> countDriversGroupedByUserId();

    List<Driver> findByUserIdAndAssignedVehicleIsNotNull(UUID userId);

    Optional<Driver> findByAssignedVehicleId(UUID vehicleId);

    List<Driver> findByStatus(com.grabrentals.vendor.entity.DriverStatus status);

    Optional<Driver> findFirstByPhoneOrderByCreatedAtDesc(String phone);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Driver d WHERE RIGHT(REPLACE(REPLACE(REPLACE(d.phone, ' ', ''), '-', ''), '+91', ''), 10) = RIGHT(REPLACE(REPLACE(REPLACE(:phone, ' ', ''), '-', ''), '+91', ''), 10)")
    Optional<Driver> findByNormalizedPhone(@org.springframework.data.repository.query.Param("phone") String phone);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) > 0 FROM Driver d WHERE RIGHT(REPLACE(REPLACE(REPLACE(d.phone, ' ', ''), '-', ''), '+91', ''), 10) = RIGHT(REPLACE(REPLACE(REPLACE(:phone, ' ', ''), '-', ''), '+91', ''), 10)")
    boolean existsByNormalizedPhone(@org.springframework.data.repository.query.Param("phone") String phone);
}

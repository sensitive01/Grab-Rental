package com.grabrentals.tariff.repository;

import com.grabrentals.tariff.entity.DriverAllowance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DriverAllowanceRepository extends JpaRepository<DriverAllowance, UUID> {

    List<DriverAllowance> findByActiveTrue();

    List<DriverAllowance> findAllByOrderByCreatedAtDesc();

    @Query("SELECT d FROM DriverAllowance d WHERE d.active = true ORDER BY d.createdAt DESC")
    List<DriverAllowance> findAllActive();
}

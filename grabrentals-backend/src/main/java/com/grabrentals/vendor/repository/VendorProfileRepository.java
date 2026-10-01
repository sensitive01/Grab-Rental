package com.grabrentals.vendor.repository;

import com.grabrentals.vendor.entity.VendorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorProfileRepository extends JpaRepository<VendorProfile, UUID> {

    Optional<VendorProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}

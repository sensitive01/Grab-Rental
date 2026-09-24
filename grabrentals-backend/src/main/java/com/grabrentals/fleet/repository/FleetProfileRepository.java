package com.grabrentals.fleet.repository;

import com.grabrentals.fleet.entity.FleetProfile;
import com.grabrentals.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FleetProfileRepository extends JpaRepository<FleetProfile, UUID> {

    Optional<FleetProfile> findByUserId(UUID userId);

    Optional<FleetProfile> findByUser(User user);
}

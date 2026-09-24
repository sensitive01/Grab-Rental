package com.grabrentals.customer.repository;

import com.grabrentals.customer.entity.CustomerProfile;
import com.grabrentals.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {

    Optional<CustomerProfile> findByUserId(UUID userId);

    Optional<CustomerProfile> findByUser(User user);
}

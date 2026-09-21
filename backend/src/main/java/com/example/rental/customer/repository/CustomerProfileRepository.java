package com.example.rental.customer.repository;

import com.example.rental.customer.entity.CustomerProfile;
import com.example.rental.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {

    Optional<CustomerProfile> findByUserId(UUID userId);

    Optional<CustomerProfile> findByUser(User user);
}

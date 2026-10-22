package com.grabrentals.customer.repository;

import com.grabrentals.customer.entity.CustomerAddress;
import com.grabrentals.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {
    List<CustomerAddress> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    Optional<CustomerAddress> findByIdAndUser(UUID id, User user);
    List<CustomerAddress> findByUserAndIsDefaultTrue(User user);
    void deleteByUser(User user);
}

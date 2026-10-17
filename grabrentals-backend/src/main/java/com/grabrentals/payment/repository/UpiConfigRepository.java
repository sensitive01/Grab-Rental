package com.grabrentals.payment.repository;

import com.grabrentals.payment.entity.UpiConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UpiConfigRepository extends JpaRepository<UpiConfig, Long> {
    Optional<UpiConfig> findFirstByOrderByIdAsc();
}

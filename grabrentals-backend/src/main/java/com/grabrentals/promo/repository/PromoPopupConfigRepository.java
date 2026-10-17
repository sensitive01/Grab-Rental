package com.grabrentals.promo.repository;

import com.grabrentals.promo.entity.PromoPopupConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromoPopupConfigRepository extends JpaRepository<PromoPopupConfig, Long> {
    Optional<PromoPopupConfig> findFirstByOrderByIdAsc();
}

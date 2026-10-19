package com.grabrentals.enquiry.repository;

import com.grabrentals.enquiry.entity.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    List<Enquiry> findAllByOrderByCreatedAtDesc();

    List<Enquiry> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);
}

package com.grabrentals.customer.repository;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Booking> findByCustomerIdAndStatusOrderByCreatedAtDesc(UUID customerId, BookingStatus status);

    List<Booking> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);

    List<Booking> findByVendorIdAndStatusOrderByCreatedAtDesc(UUID vendorId, BookingStatus status);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findAllByOrderByCreatedAtDesc();

    long countByStatus(BookingStatus status);

    long countByVendorIdAndStatus(UUID vendorId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.status IN :statuses ORDER BY b.createdAt DESC")
    List<Booking> findByStatusInOrderByCreatedAtDesc(@Param("statuses") List<BookingStatus> statuses);
}

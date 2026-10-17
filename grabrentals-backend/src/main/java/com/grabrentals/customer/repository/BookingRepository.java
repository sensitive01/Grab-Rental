package com.grabrentals.customer.repository;

import com.grabrentals.customer.entity.Booking;
import com.grabrentals.customer.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT COUNT(b) FROM Booking b WHERE (b.passengerPhone LIKE %:phone% OR b.customer.phone LIKE %:phone%) AND b.status != com.grabrentals.customer.entity.BookingStatus.CANCELLED")
    long countValidBookingsByPhone(@Param("phone") String phone);

    @Query("SELECT COUNT(b) FROM Booking b WHERE ((:phone IS NOT NULL AND (b.passengerPhone LIKE %:phone% OR b.customer.phone LIKE %:phone%)) OR (:email IS NOT NULL AND b.customer.email = :email)) AND b.status != com.grabrentals.customer.entity.BookingStatus.CANCELLED")
    long countValidBookingsByPhoneOrEmail(@Param("phone") String phone, @Param("email") String email);

    @Query("SELECT COUNT(b) FROM Booking b WHERE (UPPER(b.couponCode) = UPPER(:code) OR UPPER(b.specialInstructions) LIKE CONCAT('%', UPPER(:code), '%')) AND b.status != com.grabrentals.customer.entity.BookingStatus.CANCELLED")
    long countBookingsByCouponCode(@Param("code") String code);

    @Query("SELECT COUNT(b) FROM Booking b WHERE (UPPER(b.couponCode) = UPPER(:code) OR UPPER(b.specialInstructions) LIKE CONCAT('%', UPPER(:code), '%')) AND ((:phone IS NOT NULL AND (b.passengerPhone LIKE %:phone% OR b.customer.phone LIKE %:phone%)) OR (:email IS NOT NULL AND b.customer.email = :email)) AND b.status != com.grabrentals.customer.entity.BookingStatus.CANCELLED")
    long countBookingsWithCouponForCustomer(@Param("code") String code, @Param("phone") String phone, @Param("email") String email);

    @Modifying
    @Query("UPDATE Booking b SET b.assignedDriver = null WHERE b.assignedDriver.id = :driverId")
    void unassignDriver(@Param("driverId") UUID driverId);

    @Modifying
    @Query("UPDATE Booking b SET b.assignedVehicle = null WHERE b.assignedVehicle.id = :vehicleId")
    void unassignVehicle(@Param("vehicleId") UUID vehicleId);
}

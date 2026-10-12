package com.grabrentals.notification.repository;

import com.grabrentals.notification.entity.Notification;
import com.grabrentals.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(Role role);

    long countByRecipientRoleAndIsReadFalse(Role role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientRole = :role")
    void markAllAsReadByRole(@Param("role") Role role);
}

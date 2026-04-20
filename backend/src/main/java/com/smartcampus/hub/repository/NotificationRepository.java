package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);

    long countByRecipientRoleAndIsReadFalse(String recipientRole);

    Optional<Notification> findByIdAndRecipientRole(Long id, String recipientRole);
}
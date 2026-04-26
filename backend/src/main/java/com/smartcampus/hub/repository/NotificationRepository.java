package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);

    List<Notification> findByRecipientRoleAndRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientRole, String recipientEmail);

    long countByRecipientRoleAndIsReadFalse(String recipientRole);

    long countByRecipientRoleAndRecipientEmailIgnoreCaseAndIsReadFalse(String recipientRole, String recipientEmail);

    Optional<Notification> findByIdAndRecipientRole(Long id, String recipientRole);

    Optional<Notification> findByIdAndRecipientRoleAndRecipientEmailIgnoreCase(Long id, String recipientRole, String recipientEmail);

    // For student (USER role) server-side notification lookup by email only
    List<Notification> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientEmail);

    long countByRecipientEmailIgnoreCaseAndIsReadFalse(String recipientEmail);
}
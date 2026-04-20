package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.enums.NotificationType;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final String ADMIN_ROLE = "ADMIN";
    private static final String USER_ROLE = "USER";

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createAdminBookingNotification(Booking booking) {
        Notification notification = Notification.builder()
                .title("New booking request")
                .message(String.format(
                        "%s booked %s on %s from %s to %s.",
                        booking.getUser().getName(),
                        booking.getResource().getName(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime()
                ))
                .type(NotificationType.BOOKING_CREATED)
                .recipientRole(ADMIN_ROLE)
                .recipientEmail(null)
                .relatedEntityId(booking.getId())
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createUserBookingApprovedNotification(Booking booking) {
        Notification notification = Notification.builder()
                .title("Booking Approved")
                .message(String.format(
                        "Your booking for %s on %s from %s to %s was approved.",
                        booking.getResource().getName(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime()
                ))
                .type(NotificationType.BOOKING_APPROVED)
                .recipientRole(USER_ROLE)
                .recipientEmail(normalizeEmail(booking.getUser().getEmail()))
                .relatedEntityId(booking.getId())
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createUserBookingRejectedNotification(Booking booking) {
        String reason = (booking.getDecisionReason() == null || booking.getDecisionReason().trim().isEmpty())
                ? "No reason provided"
                : booking.getDecisionReason().trim();

        Notification notification = Notification.builder()
                .title("Booking Rejected")
                .message(String.format(
                        "Your booking for %s on %s from %s to %s was rejected. Reason: %s",
                        booking.getResource().getName(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime(),
                        reason
                ))
                .type(NotificationType.BOOKING_REJECTED)
                .recipientRole(USER_ROLE)
                .recipientEmail(normalizeEmail(booking.getUser().getEmail()))
                .relatedEntityId(booking.getId())
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForRecipient(String role, String email) {
        String normalizedRole = normalizeRole(role);
        if (ADMIN_ROLE.equals(normalizedRole)) {
            return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(normalizedRole);
        }

        String normalizedEmail = requireScopedEmail(email);
        return notificationRepository.findByRecipientRoleAndRecipientEmailIgnoreCaseOrderByCreatedAtDesc(normalizedRole, normalizedEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCountForRecipient(String role, String email) {
        String normalizedRole = normalizeRole(role);
        if (ADMIN_ROLE.equals(normalizedRole)) {
            return notificationRepository.countByRecipientRoleAndIsReadFalse(normalizedRole);
        }

        String normalizedEmail = requireScopedEmail(email);
        return notificationRepository.countByRecipientRoleAndRecipientEmailIgnoreCaseAndIsReadFalse(normalizedRole, normalizedEmail);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, String role, String email) {
        String normalizedRole = normalizeRole(role);
        Notification notification;

        if (ADMIN_ROLE.equals(normalizedRole)) {
            notification = notificationRepository.findByIdAndRecipientRole(notificationId, normalizedRole)
                    .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        } else {
            String normalizedEmail = requireScopedEmail(email);
            notification = notificationRepository.findByIdAndRecipientRoleAndRecipientEmailIgnoreCase(notificationId, normalizedRole, normalizedEmail)
                    .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return notification;
    }

    @Override
    @Transactional
    public List<Notification> markAllAsRead(String role, String email) {
        String normalizedRole = normalizeRole(role);

        List<Notification> notifications;
        if (ADMIN_ROLE.equals(normalizedRole)) {
            notifications = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(normalizedRole);
        } else {
            String normalizedEmail = requireScopedEmail(email);
            notifications = notificationRepository.findByRecipientRoleAndRecipientEmailIgnoreCaseOrderByCreatedAtDesc(normalizedRole, normalizedEmail);
        }

        notifications.forEach(notification -> notification.setRead(true));
        return notificationRepository.saveAll(notifications);
    }

    private String normalizeRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("User role is required");
        }
        return role.trim().toUpperCase();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String normalizedEmail = email.trim().toLowerCase();
        return normalizedEmail.isEmpty() ? null : normalizedEmail;
    }

    private String requireScopedEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            throw new IllegalArgumentException("User email is required");
        }
        return normalizedEmail;
    }
}
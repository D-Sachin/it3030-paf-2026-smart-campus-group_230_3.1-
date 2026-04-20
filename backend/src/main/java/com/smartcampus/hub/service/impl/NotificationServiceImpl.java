package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.enums.NotificationType;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
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
                .relatedEntityId(booking.getId())
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForRole(String role) {
        return notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(normalizeRole(role));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCountForRole(String role) {
        return notificationRepository.countByRecipientRoleAndIsReadFalse(normalizeRole(role));
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, String role) {
        Notification notification = notificationRepository.findByIdAndRecipientRole(notificationId, normalizeRole(role))
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return notification;
    }

    @Override
    @Transactional
    public List<Notification> markAllAsRead(String role) {
        String normalizedRole = normalizeRole(role);
        List<Notification> notifications = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(normalizedRole);
        notifications.forEach(notification -> notification.setRead(true));
        return notificationRepository.saveAll(notifications);
    }

    private String normalizeRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("User role is required");
        }
        return role.trim().toUpperCase();
    }
}
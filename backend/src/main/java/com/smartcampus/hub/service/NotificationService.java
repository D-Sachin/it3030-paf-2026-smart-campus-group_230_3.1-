package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface NotificationService {
    Notification createAdminBookingNotification(Booking booking);

    Notification createUserBookingApprovedNotification(Booking booking);

    Notification createUserBookingApprovedNotification(
        Long bookingId,
        String recipientEmail,
        String resourceName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime
    );

    Notification createUserBookingRejectedNotification(Booking booking);

    Notification createUserBookingRejectedNotification(
        Long bookingId,
        String recipientEmail,
        String resourceName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String decisionReason
    );

    List<Notification> getNotificationsForRecipient(String role, String email);

    long getUnreadCountForRecipient(String role, String email);

    Notification markAsRead(Long notificationId, String role, String email);

    List<Notification> markAllAsRead(String role, String email);

    Notification createTicketNotification(com.smartcampus.hub.model.User recipient, String title, String message, Long ticketId);

    void deleteAllNotifications(String role, String email);
}
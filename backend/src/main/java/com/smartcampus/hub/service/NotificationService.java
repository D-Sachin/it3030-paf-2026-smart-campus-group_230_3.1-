package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;

import java.util.List;

public interface NotificationService {
    Notification createAdminBookingNotification(Booking booking);

    Notification createUserBookingApprovedNotification(Booking booking);

    Notification createUserBookingRejectedNotification(Booking booking);

    List<Notification> getNotificationsForRecipient(String role, String email);

    long getUnreadCountForRecipient(String role, String email);

    Notification markAsRead(Long notificationId, String role, String email);

    List<Notification> markAllAsRead(String role, String email);
}
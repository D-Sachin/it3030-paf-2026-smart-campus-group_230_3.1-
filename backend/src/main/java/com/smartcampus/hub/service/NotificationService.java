package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;

import java.util.List;

public interface NotificationService {
    Notification createAdminBookingNotification(Booking booking);

    List<Notification> getNotificationsForRole(String role);

    long getUnreadCountForRole(String role);

    Notification markAsRead(Long notificationId, String role);

    List<Notification> markAllAsRead(String role);
}
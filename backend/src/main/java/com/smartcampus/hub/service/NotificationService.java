package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.model.User;

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

    /** Generic ticket notification for status updates */
    Notification createTicketNotification(User recipient, String title, String message, Long ticketId);

    /** Notify all ADMINs that a new ticket has been submitted */
    void createAdminTicketCreatedNotification(Ticket ticket);

    /** Notify a technician that a ticket has been assigned to them */
    Notification createTechnicianAssignedNotification(User technician, Ticket ticket);

    /** Notify ticket owner that a new comment was posted */
    void createCommentNotification(User recipient, Ticket ticket, User commenter);

    /** Notify a user that their role was changed by an admin */
    void createRoleChangedNotification(User user, String oldRole, String newRole);

    void deleteAllNotifications(String role, String email);

    /** Delete a single notification by ID (scoped to the requesting user) */
    void deleteNotificationById(Long id, String role, String email);
}
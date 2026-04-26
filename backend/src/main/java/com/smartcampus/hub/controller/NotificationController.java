package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            List<Notification> notifications = notificationService.getNotificationsForRecipient(normalizedRole, normalizedEmail);
            long unreadCount = notificationService.getUnreadCountForRecipient(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "Notifications retrieved successfully", notifications, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            long unreadCount = notificationService.getUnreadCountForRecipient(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "Unread count retrieved", null, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable(name = "id") Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            Notification notification = notificationService.markAsRead(id, normalizedRole, normalizedEmail);
            long unreadCount = notificationService.getUnreadCountForRecipient(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "Notification marked as read", notification, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            List<Notification> notifications = notificationService.markAllAsRead(normalizedRole, normalizedEmail);
            long unreadCount = notificationService.getUnreadCountForRecipient(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "All notifications marked as read", notifications, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteAllNotifications(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            notificationService.deleteAllNotifications(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "All notifications cleared", null, 0L));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotificationById(
            @PathVariable(name = "id") Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail
    ) {
        try {
            String normalizedRole = requireRole(userRole);
            String normalizedEmail = normalizeEmail(userEmail);
            notificationService.deleteNotificationById(id, normalizedRole, normalizedEmail);
            long unreadCount = notificationService.getUnreadCountForRecipient(normalizedRole, normalizedEmail);
            return ResponseEntity.ok(buildResponse(true, "Notification deleted", null, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    private String requireRole(String userRole) {
        if (userRole == null || userRole.trim().isEmpty()) {
            throw new IllegalArgumentException("User role is required");
        }

        return userRole.trim().toUpperCase();
    }

    private String normalizeEmail(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            return null;
        }

        return userEmail.trim().toLowerCase();
    }

    private Map<String, Object> buildResponse(boolean success, String message, Object data, Long unreadCount) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        body.put("message", message);
        body.put("data", data);
        body.put("unreadCount", unreadCount);
        return body;
    }

    private ResponseEntity<Map<String, Object>> buildError(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
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

    private static final String ADMIN_ROLE = "ADMIN";

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        try {
            String normalizedRole = requireAdminRole(userRole);
            List<Notification> notifications = notificationService.getNotificationsForRole(normalizedRole);
            long unreadCount = notificationService.getUnreadCountForRole(normalizedRole);
            return ResponseEntity.ok(buildResponse(true, "Notifications retrieved successfully", notifications, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        try {
            String normalizedRole = requireAdminRole(userRole);
            Notification notification = notificationService.markAsRead(id, normalizedRole);
            long unreadCount = notificationService.getUnreadCountForRole(normalizedRole);
            return ResponseEntity.ok(buildResponse(true, "Notification marked as read", notification, unreadCount));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        } catch (RuntimeException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        try {
            String normalizedRole = requireAdminRole(userRole);
            List<Notification> notifications = notificationService.markAllAsRead(normalizedRole);
            return ResponseEntity.ok(buildResponse(true, "All notifications marked as read", notifications, 0L));
        } catch (IllegalArgumentException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    private String requireAdminRole(String userRole) {
        if (userRole == null || userRole.trim().isEmpty()) {
            throw new IllegalArgumentException("User role is required");
        }

        if (!ADMIN_ROLE.equalsIgnoreCase(userRole.trim())) {
            throw new SecurityException("Admin access required");
        }

        return userRole.trim().toUpperCase();
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
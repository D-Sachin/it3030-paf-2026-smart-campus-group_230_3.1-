package com.smartcampus.hub.enums;

public enum NotificationType {
    BOOKING_CREATED("Booking Created", "New booking request received");

    private final String displayName;
    private final String description;

    NotificationType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
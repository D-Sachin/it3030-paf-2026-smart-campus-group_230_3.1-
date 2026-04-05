package com.smartcampus.hub.enums;

public enum BookingStatus {
    PENDING("Pending", "Awaiting admin review"),
    APPROVED("Approved", "Booking confirmed"),
    REJECTED("Rejected", "Booking request rejected"),
    CANCELLED("Cancelled", "Booking cancelled");

    private final String displayName;
    private final String description;

    BookingStatus(String displayName, String description) {
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

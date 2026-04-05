package com.smartcampus.hub.enums;

/**
 * Resource Status Enum - Member 1 Module (Facilities & Assets Catalogue)
 */
public enum ResourceStatus {
    ACTIVE("Active", "Resource is available for booking"),
    OUT_OF_SERVICE("Out of Service", "Resource is temporarily unavailable");

    private final String displayName;
    private final String description;

    ResourceStatus(String displayName, String description) {
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

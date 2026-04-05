package com.smartcampus.hub.enums;

/**
 * Resource Type Enum - Member 1 Module (Facilities & Assets Catalogue)
 */
public enum ResourceType {
    LECTURE_HALL("Lecture Hall"),
    LAB("Laboratory"),
    MEETING_ROOM("Meeting Room"),
    EQUIPMENT("Equipment");

    private final String displayName;

    ResourceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

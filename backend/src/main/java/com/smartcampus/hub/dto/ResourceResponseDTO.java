package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Response DTO for Resource API endpoints
 * Contains all resource information for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {
    
    /** Unique resource identifier */
    private Long id;
    
    /** Resource name (must be unique) */
    private String name;
    
    /** Type of resource (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT) */
    private ResourceType type;
    
    /** Maximum capacity/occupancy allowed */
    private Integer capacity;
    
    /** Physical campus location */
    private String location;
    
    /** Detailed description of resource and any special requirements */
    private String description;
    
    /** Current availability status (ACTIVE, OUT_OF_SERVICE) */
    private ResourceStatus status;
    
    /** Time from which resource is available for booking (nullable) */
    private LocalTime availableFrom;
    
    /** Time until which resource is available for booking (nullable) */
    private LocalTime availableTo;
    
    /** Timestamp when resource was created */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getResourceTypeDisplay() {
        return type != null ? type.getDisplayName() : "";
    }

    public String getResourceStatusDisplay() {
        return status != null ? status.getDisplayName() : "";
    }

    public String getAvailabilityWindow() {
        if (availableFrom != null && availableTo != null) {
            return availableFrom + " - " + availableTo;
        }
        return "Not specified";
    }
}


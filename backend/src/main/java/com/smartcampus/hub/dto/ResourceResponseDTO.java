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
 * Response DTO for Resource
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {
    
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
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


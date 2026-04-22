package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.enums.ResourceType;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

/**
 * Request DTO for Resource Creation/Update
 * Used for POST/PUT endpoints to validate and transfer resource data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDTO {
    
    /** Unique resource identifier (3-100 chars) */
    @NotBlank(message = "Resource name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    /** Type of resource (required: LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT) */
    @NotNull(message = "Resource type is required")
    private ResourceType type;

    /** Maximum capacity (1-500) */
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than 0")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer capacity;

    /** Physical campus location (3-100 chars) */
    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    private String location;

    /** Detailed description of resource (max 500 chars) */
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /** Availability status (required: ACTIVE, OUT_OF_SERVICE) */
    @NotNull(message = "Status is required")
    private ResourceStatus status;

    /** Start of availability window (HH:mm:ss format, optional) */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Schema(type = "string", format = "time", example = "08:00:00")
    private LocalTime availableFrom;

    /** End of availability window (HH:mm:ss format, optional) */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Schema(type = "string", format = "time", example = "18:00:00")
    private LocalTime availableTo;
}


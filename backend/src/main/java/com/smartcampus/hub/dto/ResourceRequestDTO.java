package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.ResourceStatus;
import com.smartcampus.hub.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

/**
 * Request DTO for Resource Creation/Update
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDTO {
    
    @NotBlank(message = "Resource name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than 0")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    private String location;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private LocalTime availableFrom;
    private LocalTime availableTo;
}


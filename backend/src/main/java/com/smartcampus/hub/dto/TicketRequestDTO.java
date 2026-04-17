package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotBlank(message = "Resource location is required")
    private String resourceLocation;

    @NotBlank(message = "Preferred contact details are required")
    private String preferredContactDetails;

    private Long userId; // For demo/role-switcher support
}

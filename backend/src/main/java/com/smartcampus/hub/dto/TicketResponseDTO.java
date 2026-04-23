package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String userName;
    private String technicianName;
    private Long technicianId;
    private List<AttachmentResponseDTO> attachments;
    private List<CommentResponseDTO> comments;

    private String resourceLocation;
    private String preferredContactDetails;
    private String resolutionNotes;

    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
    private String timeToFirstResponse;
    private String timeToResolution;
}

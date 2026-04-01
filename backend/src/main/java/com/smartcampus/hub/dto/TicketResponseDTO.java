package com.smartcampus.hub.dto;

import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String userName;
    private String technicianName;
    private List<AttachmentResponseDTO> attachments;
    private List<CommentResponseDTO> comments;

    private String resourceLocation;
    private String preferredContactDetails;
    private String resolutionNotes;
}

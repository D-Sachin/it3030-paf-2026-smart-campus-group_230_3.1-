package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AttachmentResponseDTO;
import com.smartcampus.hub.dto.CommentRequestDTO;
import com.smartcampus.hub.dto.CommentResponseDTO;
import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO dto);
    TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto);
    List<TicketResponseDTO> getAllTickets(TicketStatus status, Priority priority, String category, String searchTerm, Long technicianId);

    TicketResponseDTO getTicketById(Long id); // Added

    List<TicketResponseDTO> getTicketsByUserId(Long userId, TicketStatus status, Priority priority);
    TicketResponseDTO updateTicketStatus(Long id, TicketStatus status);
    TicketResponseDTO assignTechnician(Long id, Long technicianId);
    AttachmentResponseDTO uploadAttachment(Long ticketId, MultipartFile file);
    void deleteAttachment(Long attachmentId);
    List<CommentResponseDTO> addComment(Long ticketId, CommentRequestDTO dto);
    void updateComment(Long commentId, CommentRequestDTO dto);
    void deleteComment(Long commentId);
    TicketResponseDTO updateResolutionNotes(Long id, String notes);
}

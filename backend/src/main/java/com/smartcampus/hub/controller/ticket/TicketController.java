package com.smartcampus.hub.controller.ticket;

import com.smartcampus.hub.dto.AssignTechnicianDTO;
import com.smartcampus.hub.dto.AttachmentResponseDTO;
import com.smartcampus.hub.dto.CommentRequestDTO;
import com.smartcampus.hub.dto.CommentResponseDTO;
import com.smartcampus.hub.dto.StatusUpdateDTO;
import com.smartcampus.hub.dto.TicketRequestDTO;
import com.smartcampus.hub.dto.TicketResponseDTO;
import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody TicketRequestDTO ticketRequestDTO) {
        TicketResponseDTO createdTicket = ticketService.createTicket(ticketRequestDTO);
        return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {
        System.out.println("DEBUG: getAllTickets - status: " + status + ", category: " + category + ", searchTerm: " + searchTerm + ", startDate: " + startDate + ", endDate: " + endDate);
        List<TicketResponseDTO> tickets = ticketService.getAllTickets(status, priority, category, searchTerm, technicianId, startDate, endDate);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {
        System.out.println("DEBUG: getTicketsByUserId - userId: " + userId + ", status: " + status + ", category: " + category + ", searchTerm: " + searchTerm + ", startDate: " + startDate + ", endDate: " + endDate);
        List<TicketResponseDTO> tickets = ticketService.getTicketsByUserId(userId, status, priority, category, searchTerm, startDate, endDate);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequestDTO ticketRequestDTO) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticketRequestDTO));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdateDTO) {
        try {
            java.nio.file.Files.writeString(
                java.nio.file.Paths.get("debug_controller.log"), 
                "Received status update request for ticket " + id + " to " + statusUpdateDTO.getStatus() + "\n", 
                java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND
            );
        } catch (Exception e) {}
        
        TicketResponseDTO updatedTicket = ticketService.updateTicketStatus(id, statusUpdateDTO.getStatus());
        return ResponseEntity.ok(updatedTicket);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianDTO assignTechnicianDTO) {
        TicketResponseDTO updatedTicket = ticketService.assignTechnician(id, assignTechnicianDTO.getTechnicianId());
        return ResponseEntity.ok(updatedTicket);
    }

    @PutMapping("/{id}/resolution")
    public ResponseEntity<TicketResponseDTO> updateResolutionNotes(@PathVariable Long id, @RequestBody String notes) {
        return ResponseEntity.ok(ticketService.updateResolutionNotes(id, notes));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponseDTO> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        AttachmentResponseDTO response = ticketService.uploadAttachment(id, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        ticketService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO commentRequestDTO) {
        List<CommentResponseDTO> comments = ticketService.addComment(id, commentRequestDTO);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Void> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDTO commentRequestDTO) {
        ticketService.updateComment(commentId, commentRequestDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        ticketService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}

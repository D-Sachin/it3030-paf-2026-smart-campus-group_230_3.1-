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
            @RequestParam(required = false) Priority priority) {
        List<TicketResponseDTO> tickets = ticketService.getAllTickets(status, priority);
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
            @RequestParam(required = false) Priority priority) {
        List<TicketResponseDTO> tickets = ticketService.getTicketsByUserId(userId, status, priority);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdateDTO) {
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

    @PostMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponseDTO>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO commentRequestDTO) {
        List<CommentResponseDTO> comments = ticketService.addComment(id, commentRequestDTO);
        return ResponseEntity.ok(comments);
    }
}

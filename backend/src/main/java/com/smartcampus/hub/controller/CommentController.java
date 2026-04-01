package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.CommentRequestDTO;
import com.smartcampus.hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final TicketService ticketService;

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateComment(@PathVariable Long id, @Valid @RequestBody CommentRequestDTO dto) {
        ticketService.updateComment(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        ticketService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}

package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingDecisionDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequestDTO requestDTO) {
        try {
            BookingResponseDTO response = bookingService.createBooking(requestDTO);
            return buildSuccess("Booking request submitted successfully", response, HttpStatus.CREATED);
        } catch (BookingConflictException ex) {
            return buildError(ex.getMessage(), HttpStatus.CONFLICT);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyBookings(@RequestParam(required = false) BookingStatus status) {
        List<BookingResponseDTO> responses = bookingService.getMyBookings(status);
        return buildSuccess("My bookings retrieved successfully", responses, HttpStatus.OK);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminBookings(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam(required = false) BookingStatus status) {
        if (!isAdmin(userRole)) {
            return buildError("Admin access required.", HttpStatus.FORBIDDEN);
        }

        try {
            List<BookingResponseDTO> responses = bookingService.getAdminBookings(status);
            return buildSuccess("Bookings retrieved successfully", responses, HttpStatus.OK);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBookingById(@PathVariable Long id) {
        try {
            BookingResponseDTO response = bookingService.getBookingById(id);
            return buildSuccess("Booking retrieved successfully", response, HttpStatus.OK);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        } catch (NoSuchElementException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            return buildError("Failed to retrieve booking due to an unexpected server error.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody(required = false) BookingDecisionDTO decisionDTO) {
        if (!isAdmin(userRole)) {
            return buildError("Admin access required.", HttpStatus.FORBIDDEN);
        }

        try {
            String reason = decisionDTO != null ? decisionDTO.getReason() : null;
            BookingResponseDTO response = bookingService.approveBooking(id, reason);
            return buildSuccess("Booking approved successfully", response, HttpStatus.OK);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        } catch (BookingConflictException ex) {
            return buildError(ex.getMessage(), HttpStatus.CONFLICT);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (NoSuchElementException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            return buildError("Failed to approve booking due to an unexpected server error.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @Valid @RequestBody BookingDecisionDTO decisionDTO) {
        if (!isAdmin(userRole)) {
            return buildError("Admin access required.", HttpStatus.FORBIDDEN);
        }

        try {
            BookingResponseDTO response = bookingService.rejectBooking(id, decisionDTO.getReason());
            return buildSuccess("Booking rejected successfully", response, HttpStatus.OK);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (NoSuchElementException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            return buildError("Failed to reject booking due to an unexpected server error.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id) {
        try {
            BookingResponseDTO response = bookingService.cancelBooking(id);
            return buildSuccess("Booking cancelled successfully", response, HttpStatus.OK);
        } catch (SecurityException ex) {
            return buildError(ex.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (NoSuchElementException ex) {
            return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            return buildError("Failed to cancel booking due to an unexpected server error.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<Map<String, Object>> buildSuccess(String message, Object data, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", message);
        body.put("data", data);
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<Map<String, Object>> buildError(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    private boolean isAdmin(String role) {
        return role != null && "ADMIN".equalsIgnoreCase(role.trim());
    }
}

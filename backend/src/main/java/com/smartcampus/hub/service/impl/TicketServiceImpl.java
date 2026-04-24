package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.dto.*;
import com.smartcampus.hub.enums.Priority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;
import com.smartcampus.hub.service.NotificationService;
import com.smartcampus.hub.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;

    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO dto) {
        User user;
        
        // Use explicit userId if provided (for demo/role-switcher support)
        if (dto.getUserId() != null) {
            final Long uid = dto.getUserId();
            user = userRepository.findById(uid)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + uid));
        } else {
            // Get current logged-in user from SecurityContext
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
                 throw new RuntimeException("Authentication required. Please ensure you are logged in.");
            }

            final String email;
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Logged in user not found in database: " + email));
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());
        ticket.setStatus(TicketStatus.OPEN); // Default status
        ticket.setUser(user);
        ticket.setResourceLocation(dto.getResourceLocation());
        ticket.setPreferredContactDetails(dto.getPreferredContactDetails());

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record initial OPEN status in history
        ticketStatusHistoryRepository.save(TicketStatusHistory.builder()
                .ticket(savedTicket)
                .status(savedTicket.getStatus())
                .changedBy(user)
                .build());

        return mapToResponseDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Only OPEN tickets can be edited
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException("Only OPEN tickets can be edited.");
        }

        // Determine the requesting user
        User requestingUser;
        if (dto.getUserId() != null) {
            requestingUser = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
        } else {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
                 throw new RuntimeException("Authentication required. Please ensure you are logged in.");
            }

            Object principal = authentication.getPrincipal();
            String email = (principal instanceof UserDetails)
                    ? ((UserDetails) principal).getUsername()
                    : principal.toString();
            requestingUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        }

        // Only the ticket owner may edit
        if (!ticket.getUser().getId().equals(requestingUser.getId())) {
            throw new RuntimeException("Only the ticket owner can edit ticket details.");
        }

        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());
        ticket.setResourceLocation(dto.getResourceLocation());
        ticket.setPreferredContactDetails(dto.getPreferredContactDetails());

        return mapToResponseDTO(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets(TicketStatus status, Priority priority, String category, String searchTerm, Long technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Ticket> spec = getTicketSpecification(null, technicianId, status, priority, category, searchTerm, startDate, endDate);
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        return ticketRepository.findAll(spec, sort).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        return mapToResponseDTO(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByUserId(Long userId, TicketStatus status, Priority priority, String category, String searchTerm, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Ticket> spec = getTicketSpecification(userId, null, status, priority, category, searchTerm, startDate, endDate);
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        return ticketRepository.findAll(spec, sort).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Get current logged-in user
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
             throw new RuntimeException("Authentication required. Please ensure you are logged in.");
        }
        
        final String currentEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            currentEmail = ((UserDetails) principal).getUsername();
        } else {
            currentEmail = principal.toString();
        }

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentEmail));

        // Authorization check
        String role = currentUser.getRole();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean isTechnician = "TECHNICIAN".equalsIgnoreCase(role);
        boolean isAssignedTech = ticket.getTechnician() != null && ticket.getTechnician().getId().equals(currentUser.getId());
        boolean isUnassigned = ticket.getTechnician() == null;

        // Ensure we still keep the variable so the self-assign logic below works
        boolean isTechnicianCanSelfAssign = isTechnician && isUnassigned && (status == TicketStatus.IN_PROGRESS || status == TicketStatus.RESOLVED);

        // Allow any technician to update status (assigned to them, or unassigned ticket they pick up).
        // The frontend UI already limits which action buttons are visible to the correct users.
        boolean canUpdate = isAdmin || isAssignedTech || (isTechnician && isUnassigned);

        if (!canUpdate) {
            throw new RuntimeException("Only Admins or the assigned Technician can update ticket status.");
        }

        // IF technician is self-assigning
        if (isTechnicianCanSelfAssign) {
            ticket.setTechnician(currentUser);
            if (ticket.getAssignedAt() == null) {
                ticket.setAssignedAt(LocalDateTime.now());
            }
        }

        ticket.setStatus(status);

        // SLA logic: Set resolvedAt when transitioning to terminal states
        if (status == TicketStatus.RESOLVED || status == TicketStatus.REJECTED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status == TicketStatus.OPEN || status == TicketStatus.IN_PROGRESS) {
            ticket.setResolvedAt(null);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        // Record status change in history
        ticketStatusHistoryRepository.save(TicketStatusHistory.builder()
                .ticket(updatedTicket)
                .status(status)
                .changedBy(currentUser)
                .build());

        // Notify user about status change
        notificationService.createTicketNotification(
            ticket.getUser(),
            "Ticket Updated",
            "Ticket status updated to " + status + " for ticket #" + id,
            id
        );

        return mapToResponseDTO(updatedTicket);
    }

    @Override
    @Transactional
    public TicketResponseDTO assignTechnician(Long id, Long technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Get current logged-in user to check if they are ADMIN
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
             throw new RuntimeException("Authentication required. Please ensure you are logged in.");
        }

        final String currentEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            currentEmail = ((UserDetails) principal).getUsername();
        } else {
            currentEmail = principal.toString();
        }

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Logged in user not found: " + currentEmail));

        // Authorization check: Admin OR Technician self-assigning
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isSelfAssign = "TECHNICIAN".equalsIgnoreCase(currentUser.getRole()) && technicianId.equals(currentUser.getId());

        if (!isAdmin && !isSelfAssign) {
            throw new RuntimeException("Only Admins can assign technicians, or Technicians can self-assign.");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found with id: " + technicianId));

        ticket.setTechnician(technician);
        
        // SLA logic: Set assignedAt on first assignment
        if (ticket.getAssignedAt() == null) {
            ticket.setAssignedAt(LocalDateTime.now());
        }

        // Automatically set status to IN_PROGRESS when assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record status change in history if it changed
        ticketStatusHistoryRepository.save(TicketStatusHistory.builder()
                .ticket(savedTicket)
                .status(savedTicket.getStatus())
                .changedBy(currentUser)
                .build());

        return mapToResponseDTO(savedTicket);
    }

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final AttachmentRepository attachmentRepository;

    @Override
    @Transactional
    public AttachmentResponseDTO uploadAttachment(Long ticketId, MultipartFile file) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // Check max attachments (3)
        if (ticket.getAttachments() != null && ticket.getAttachments().size() >= 3) {
            throw new RuntimeException("Maximum of 3 attachments allowed per ticket.");
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save attachment record
            String fileUrl = "/api/files/uploads/" + fileName;
            Attachment attachment = Attachment.builder()
                    .fileName(fileName)
                    .filePath(filePath.toString())
                    .fileUrl(fileUrl)
                    .ticket(ticket)
                    .build();

            Attachment savedAttachment = attachmentRepository.save(attachment);

            return AttachmentResponseDTO.builder()
                    .id(savedAttachment.getId())
                    .fileName(savedAttachment.getFileName())
                    .fileUrl(fileUrl)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id: " + attachmentId));

        // Delete physical file from disk
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail — DB record still needs to be removed
            System.err.println("Could not delete physical file: " + e.getMessage());
        }

        attachmentRepository.delete(attachment);
    }

    @Override
    @Transactional
    public List<CommentResponseDTO> addComment(Long ticketId, CommentRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User user;
        
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
        } else if (authentication != null && authentication.getPrincipal() != null
                && !"anonymousUser".equals(authentication.getPrincipal().toString())) {
            String email;
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        } else {
            // Fallback for demo/unauthenticated mode
            user = userRepository.findByEmail("guest@smartcampus.local").orElseGet(() -> {
                User guest = new User();
                guest.setName("Guest User");
                guest.setEmail("guest@smartcampus.local");
                guest.setRole("USER");
                guest.setPassword("password");
                return userRepository.save(guest);
            });
        }

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .ticket(ticket)
                .user(user)
                .build();

        commentRepository.save(comment);

        // Notify ticket owner about new comment (if commenter is not the owner)
        if (!ticket.getUser().getId().equals(user.getId())) {
            notificationService.createTicketNotification(
                ticket.getUser(),
                "New Comment",
                "A new comment was added to your ticket #" + ticketId + " by " + user.getName(),
                ticketId
            );
        }

        // Return updated comment list
        return commentRepository.findByTicket(ticket).stream()
                .map(this::mapToCommentResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateComment(Long commentId, CommentRequestDTO dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
             throw new RuntimeException("Authentication required. Please ensure you are logged in.");
        }

        final String currentEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            currentEmail = ((UserDetails) principal).getUsername();
        } else {
            currentEmail = principal.toString();
        }

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentEmail));

        // Only author can edit
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to edit this comment.");
        }

        comment.setContent(dto.getContent());
        commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
             throw new RuntimeException("Authentication required. Please ensure you are logged in.");
        }

        final String currentEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            currentEmail = ((UserDetails) principal).getUsername();
        } else {
            currentEmail = principal.toString();
        }

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentEmail));

        // Only owner or admin can delete
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = comment.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You are not authorized to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public TicketResponseDTO updateResolutionNotes(Long id, String notes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal().toString())) {
             throw new RuntimeException("Authentication required. Please ensure you are logged in.");
        }

        final String currentEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            currentEmail = ((UserDetails) principal).getUsername();
        } else {
            currentEmail = principal.toString();
        }

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentEmail));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean isTechnician = "TECHNICIAN".equalsIgnoreCase(currentUser.getRole());
        boolean isAssignedTech = ticket.getTechnician() != null && ticket.getTechnician().getId().equals(currentUser.getId());
        boolean isUnassigned = ticket.getTechnician() == null;

        boolean canUpdate = isAdmin || isAssignedTech || (isTechnician && isUnassigned);

        if (!canUpdate) {
            throw new RuntimeException("Only Admins or the assigned Technician can add resolution notes.");
        }

        // IF technician is self-assigning while resolving
        if (isTechnician && isUnassigned) {
            ticket.setTechnician(currentUser);
            if (ticket.getAssignedAt() == null) {
                ticket.setAssignedAt(LocalDateTime.now());
            }
        }

        // Check if resolution notes already exist
        // Relaxed check: Allow updating if notes were previously added by the SAME user, if current user is ADMIN, 
        // OR if the current user is the ASSIGNED technician.
        if (ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isBlank()) {
            boolean isAuthor = ticket.getResolutionNotesAddedBy() != null && ticket.getResolutionNotesAddedBy().getId().equals(currentUser.getId());
            if (!isAdmin && !isAuthor && !isAssignedTech) {
                throw new RuntimeException("Resolution notes have already been added by " + 
                        (ticket.getResolutionNotesAddedBy() != null ? ticket.getResolutionNotesAddedBy().getName() : "another user") + 
                        ". Only Admins or the assigned Technician can modify resolution notes.");
            }
        }

        ticket.setResolutionNotes(notes != null ? notes.replace("\"", "") : ""); // Cleanup potential JSON quotes
        ticket.setResolutionNotesAddedBy(currentUser);
        ticket.setResolutionNotesAddedAt(LocalDateTime.now());
        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponseDTO(updatedTicket);
    }

    private Specification<Ticket> getTicketSpecification(Long userId, Long technicianId, TicketStatus status, Priority priority, String category, String searchTerm, LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }
            if (technicianId != null) {
                predicates.add(cb.equal(root.get("technician").get("id"), technicianId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String searchPattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate titleSearch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descSearch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate locSearch = cb.like(cb.lower(root.get("resourceLocation")), searchPattern);
                predicates.add(cb.or(titleSearch, descSearch, locSearch));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private TicketResponseDTO mapToResponseDTO(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .userId(ticket.getUser() != null ? ticket.getUser().getId() : null)
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .userName(ticket.getUser() != null ? ticket.getUser().getName() : "Unknown")
                .technicianName(ticket.getTechnician() != null ? ticket.getTechnician().getName() : "Unassigned")
                .technicianId(ticket.getTechnician() != null ? ticket.getTechnician().getId() : null)
                .attachments(ticket.getAttachments() != null ? ticket.getAttachments().stream()
                        .map(att -> AttachmentResponseDTO.builder()
                                .id(att.getId())
                                .fileName(att.getFileName())
                                .fileUrl("/api/files/uploads/" + att.getFileName())
                                .build())
                        .collect(Collectors.toList()) : Collections.emptyList())
                .comments(ticket.getComments() != null ? ticket.getComments().stream()
                        .map(this::mapToCommentResponseDTO)
                        .collect(Collectors.toList()) : Collections.emptyList())
                .preferredContactDetails(ticket.getPreferredContactDetails())
                .resourceLocation(ticket.getResourceLocation())
                .resolutionNotes(ticket.getResolutionNotes())
                .resolutionNotesAddedByName(ticket.getResolutionNotesAddedBy() != null ? ticket.getResolutionNotesAddedBy().getName() : null)
                .resolutionNotesAddedById(ticket.getResolutionNotesAddedBy() != null ? ticket.getResolutionNotesAddedBy().getId() : null)
                .resolutionNotesAddedAt(ticket.getResolutionNotesAddedAt())
                .assignedAt(ticket.getAssignedAt())
                .resolvedAt(ticket.getResolvedAt())
                .timeToFirstResponse(calculateDuration(ticket.getCreatedAt(), ticket.getAssignedAt()))
                .timeToResolution(calculateDuration(ticket.getCreatedAt(), ticket.getResolvedAt()))
                .statusHistory(ticketStatusHistoryRepository.findByTicketOrderByTimestampDesc(ticket).stream()
                        .map(this::mapToStatusHistoryDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private String calculateDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return null;
        java.time.Duration duration = java.time.Duration.between(start, end);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        
        if (hours == 0) return minutes + "m";
        return hours + "h " + minutes + "m";
    }

    private StatusHistoryDTO mapToStatusHistoryDTO(TicketStatusHistory history) {
        return StatusHistoryDTO.builder()
                .id(history.getId())
                .status(history.getStatus())
                .changedByName(history.getChangedBy() != null ? history.getChangedBy().getName() : "System")
                .changedByEmail(history.getChangedBy() != null ? history.getChangedBy().getEmail() : "system")
                .timestamp(history.getTimestamp())
                .build();
    }

    private CommentResponseDTO mapToCommentResponseDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .content(comment.getContent())
                .userName(comment.getUser() != null ? comment.getUser().getName() : "Unknown")
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

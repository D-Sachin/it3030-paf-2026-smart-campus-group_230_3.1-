package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.SupportMessage;
import com.smartcampus.hub.repository.SupportMessageRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support-messages")
@RequiredArgsConstructor
public class SupportMessageController {

    private final SupportMessageRepository supportMessageRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSupportMessage(@Valid @RequestBody SupportMessageRequest request) {
        SupportMessage supportMessage = SupportMessage.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .message(request.getMessage().trim())
                .build();

        SupportMessage savedSupportMessage = supportMessageRepository.save(supportMessage);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(true, "Support message submitted successfully", savedSupportMessage));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSupportMessages(@RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(buildResponse(false, "Admin access required", null));
        }

        List<SupportMessage> supportMessages = supportMessageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(buildResponse(true, "Support messages retrieved successfully", supportMessages));
    }

    private Map<String, Object> buildResponse(boolean success, String message, Object data) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        body.put("message", message);
        body.put("data", data);
        return body;
    }

    private boolean isAdmin(String role) {
        return role != null && "ADMIN".equalsIgnoreCase(role.trim());
    }

    public static class SupportMessageRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Message is required")
        private String message;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
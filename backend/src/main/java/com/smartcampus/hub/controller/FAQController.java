package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.FAQ;
import com.smartcampus.hub.repository.FAQRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FAQController {

    private final FAQRepository faqRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFAQs() {
        List<FAQ> faqs = faqRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(buildResponse(true, "FAQs retrieved successfully", faqs));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFAQ(
            @Valid @RequestBody FAQRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(buildResponse(false, "Admin access required", null));
        }

        FAQ faq = FAQ.builder()
                .question(request.getQuestion().trim())
                .answer(request.getAnswer().trim())
                .build();

        FAQ savedFAQ = faqRepository.save(faq);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(true, "FAQ created successfully", savedFAQ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFAQ(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole
    ) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(buildResponse(false, "Admin access required", null));
        }

        if (!faqRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildResponse(false, "FAQ not found", null));
        }

        faqRepository.deleteById(id);
        return ResponseEntity.ok(buildResponse(true, "FAQ deleted successfully", null));
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

    public static class FAQRequest {
        @NotBlank(message = "Question is required")
        private String question;

        @NotBlank(message = "Answer is required")
        private String answer;

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }
}

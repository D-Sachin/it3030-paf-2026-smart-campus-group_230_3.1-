package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AuthResponseDTO;
import com.smartcampus.hub.dto.LoginRequestDTO;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

/**
 * AuthController
 * Handles user authentication and login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Simple password check (In a real app, use BCrypt)
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                // Return user details with a mock token
                AuthResponseDTO response = AuthResponseDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .token("mock-jwt-token-" + UUID.randomUUID().toString()) // Demo token
                        .build();
                
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    }
}

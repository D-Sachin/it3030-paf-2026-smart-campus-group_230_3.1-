package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AuthResponseDTO;
import com.smartcampus.hub.dto.LoginRequestDTO;
import com.smartcampus.hub.dto.GoogleLoginRequest;
import com.smartcampus.hub.dto.TwoFactorVerifyDTO;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.TwoFactorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * AuthController
 * Handles user authentication, login, and two-factor verification
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final TwoFactorService twoFactorService;
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Simple password check (In a real app, use BCrypt)
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                
                // Check if user role requires 2FA (ADMIN or TECHNICIAN)
                // Bypass 2FA for demo accounts for easier testing/review
                if (("ADMIN".equals(user.getRole()) || "TECHNICIAN".equals(user.getRole())) &&
                    !"admin@smartcampus.com".equals(user.getEmail()) && 
                    !"tech@smartcampus.com".equals(user.getEmail())) {
                    return handle2FALogin(user);
                }

                // For non-2FA roles (e.g., USER/STUDENT), return full auth response directly
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

    /**
     * Handle 2FA login flow for ADMIN and TECHNICIAN users.
     * - First time: generate secret, return QR code URL
     * - Returning user: just require code verification
     */
    private ResponseEntity<?> handle2FALogin(User user) {
        String tempToken = UUID.randomUUID().toString();
        twoFactorService.storeTempToken(tempToken, user.getId());

        if (user.getTwoFactorSecret() == null || user.getTwoFactorSecret().isEmpty()) {
            // First-time setup: generate a new TOTP secret
            String secret = twoFactorService.generateSecret();
            user.setTwoFactorSecret(secret);
            userRepository.save(user);

            String qrCodeUrl = twoFactorService.getQrCodeUrl(secret, user.getEmail());

            AuthResponseDTO response = AuthResponseDTO.builder()
                    .twoFactorRequired(true)
                    .twoFactorSetup(true)
                    .qrCodeUrl(qrCodeUrl)
                    .tempToken(tempToken)
                    .build();

            return ResponseEntity.ok(response);
        } else {
            // Returning user: already has 2FA set up
            AuthResponseDTO response = AuthResponseDTO.builder()
                    .twoFactorRequired(true)
                    .twoFactorSetup(false)
                    .tempToken(tempToken)
                    .build();

            return ResponseEntity.ok(response);
        }
    }

    /**
     * Verify a 2FA TOTP code and complete the login
     */
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyDTO request) {
        Long userId = twoFactorService.validateTempToken(request.getTempToken());

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Session expired. Please log in again.");
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found.");
        }

        User user = userOptional.get();

        try {
            int code = Integer.parseInt(request.getCode());
            if (!twoFactorService.verifyCode(user.getTwoFactorSecret(), code)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid verification code. Please try again.");
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Verification code must be a 6-digit number.");
        }

        // Mark 2FA as enabled if this was the first setup
        if (user.getTwoFactorEnabled() == null || !user.getTwoFactorEnabled()) {
            user.setTwoFactorEnabled(true);
            userRepository.save(user);
        }

        // Clean up temp token and return full auth response
        twoFactorService.removeTempToken(request.getTempToken());

        AuthResponseDTO response = AuthResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .token("mock-jwt-token-" + UUID.randomUUID().toString())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(request.getToken());
            HttpEntity<String> entity = new HttpEntity<>("", headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, Map.class);
            Map<String, Object> userInfo = response.getBody();
            
            if (userInfo == null || !userInfo.containsKey("email")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }
            
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;
            
            if (userOptional.isPresent()) {
                user = userOptional.get();
            } else {
                user = User.builder()
                        .name(name != null ? name : "Google User")
                        .email(email)
                        .role("STUDENT") // default role
                        .build();
                user = userRepository.save(user);
            }
            
            AuthResponseDTO authResponse = AuthResponseDTO.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .token("mock-jwt-token-" + UUID.randomUUID().toString()) // Demo token
                    .build();
                    
            return ResponseEntity.ok(authResponse);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google login failed: " + e.getMessage());
        }
    }
}

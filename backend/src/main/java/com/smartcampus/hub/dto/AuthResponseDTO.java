package com.smartcampus.hub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponseDTO
 * Returns user details and authentication token
 * Includes 2FA fields when two-factor authentication is required
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String token;

    // Two-Factor Authentication fields
    private Boolean twoFactorRequired;
    private Boolean twoFactorSetup;
    private String qrCodeUrl;
    private String tempToken;
}

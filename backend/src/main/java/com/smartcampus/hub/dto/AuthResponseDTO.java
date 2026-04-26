package com.smartcampus.hub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * AuthResponseDTO
 * Returns user details and authentication token
 * Includes 2FA fields when two-factor authentication is required
 */
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

    public AuthResponseDTO() {}

    // Constructor for regular login/register
    public AuthResponseDTO(Long id, String name, String email, String role, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    // Full constructor
    public AuthResponseDTO(Long id, String name, String email, String role, String token, 
                           Boolean twoFactorRequired, Boolean twoFactorSetup, String qrCodeUrl, String tempToken) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.twoFactorRequired = twoFactorRequired;
        this.twoFactorSetup = twoFactorSetup;
        this.qrCodeUrl = qrCodeUrl;
        this.tempToken = tempToken;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Boolean getTwoFactorRequired() { return twoFactorRequired; }
    public void setTwoFactorRequired(Boolean twoFactorRequired) { this.twoFactorRequired = twoFactorRequired; }

    public Boolean getTwoFactorSetup() { return twoFactorSetup; }
    public void setTwoFactorSetup(Boolean twoFactorSetup) { this.twoFactorSetup = twoFactorSetup; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }

    // Manual static builder-like methods if needed, but we'll use constructors in Controller
}

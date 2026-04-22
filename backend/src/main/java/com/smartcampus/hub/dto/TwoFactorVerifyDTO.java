package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TwoFactorVerifyDTO
 * Captures the temp token and TOTP code for 2FA verification
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorVerifyDTO {

    @NotBlank(message = "Temp token is required")
    private String tempToken;

    @NotBlank(message = "Verification code is required")
    private String code;
}

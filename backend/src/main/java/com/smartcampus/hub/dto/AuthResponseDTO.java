package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponseDTO
 * Returns user details and authentication token
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String token;
}

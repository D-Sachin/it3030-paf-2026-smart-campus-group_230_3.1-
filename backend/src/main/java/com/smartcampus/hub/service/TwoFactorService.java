package com.smartcampus.hub.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TwoFactorService
 * Handles TOTP secret generation, QR code URL creation, and code verification.
 * Manages temporary tokens for the 2FA verification flow.
 */
@Service
public class TwoFactorService {

    private static final String ISSUER = "SmartCampusHub";
    private static final long TEMP_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

    // In-memory store: tempToken -> {userId, expiresAt}
    private final ConcurrentHashMap<String, TempTokenEntry> tempTokenStore = new ConcurrentHashMap<>();

    /**
     * Generate a new TOTP secret key
     */
    public String generateSecret() {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    /**
     * Build the otpauth:// URL for QR code generation
     * Format: otpauth://totp/SmartCampusHub:user@email.com?secret=SECRET&issuer=SmartCampusHub
     */
    public String getQrCodeUrl(String secret, String email) {
        String encodedIssuer = URLEncoder.encode(ISSUER, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                encodedIssuer, encodedEmail, secret, encodedIssuer);
    }

    /**
     * Verify a TOTP code against the secret
     */
    public boolean verifyCode(String secret, int code) {
        return googleAuthenticator.authorize(secret, code);
    }

    /**
     * Store a temporary token mapped to a user ID
     */
    public void storeTempToken(String tempToken, Long userId) {
        // Clean up expired tokens periodically
        cleanupExpiredTokens();
        tempTokenStore.put(tempToken, new TempTokenEntry(userId, System.currentTimeMillis() + TEMP_TOKEN_EXPIRY_MS));
    }

    /**
     * Retrieve and validate a temp token. Returns userId or null if expired/invalid.
     */
    public Long validateTempToken(String tempToken) {
        TempTokenEntry entry = tempTokenStore.get(tempToken);
        if (entry == null) {
            return null;
        }
        if (System.currentTimeMillis() > entry.expiresAt) {
            tempTokenStore.remove(tempToken);
            return null;
        }
        return entry.userId;
    }

    /**
     * Remove a temp token after successful verification
     */
    public void removeTempToken(String tempToken) {
        tempTokenStore.remove(tempToken);
    }

    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        tempTokenStore.entrySet().removeIf(e -> now > e.getValue().expiresAt);
    }

    private static class TempTokenEntry {
        final Long userId;
        final long expiresAt;

        TempTokenEntry(Long userId, long expiresAt) {
            this.userId = userId;
            this.expiresAt = expiresAt;
        }
    }
}

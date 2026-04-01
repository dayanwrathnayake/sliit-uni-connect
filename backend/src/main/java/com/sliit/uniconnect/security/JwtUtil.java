package com.sliit.uniconnect.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    /** 15 minutes in milliseconds */
    private static final long ACCESS_TOKEN_VALIDITY_MS = 15L * 60 * 1000;

    /** 7 days in milliseconds */
    private static final long REFRESH_TOKEN_VALIDITY_MS = 7L * 24 * 60 * 60 * 1000;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        // Secret must be ≥ 32 bytes for HS256
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ── Token generation ──────────────────────────────────────────────────────

    /**
     * Generates a short-lived access token (15 min).
     * Subject is the userId; claims include the user's role.
     */
    public String generateAccessToken(String userId, String role) {
        return buildToken(userId, role, ACCESS_TOKEN_VALIDITY_MS);
    }

    /**
     * Generates a long-lived refresh token (7 days).
     * Only the userId is encoded — role is not needed for refresh.
     */
    public String generateRefreshToken(String userId) {
        return buildToken(userId, null, REFRESH_TOKEN_VALIDITY_MS);
    }

    // ── Token parsing ─────────────────────────────────────────────────────────

    /**
     * Returns true if the token signature is valid and it has not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token); // throws if invalid or expired
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts the userId (JWT subject) from the token.
     * Throws a JwtException if the token is invalid.
     */
    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extracts the role claim from the token.
     * Returns null if the claim is absent (e.g. refresh tokens).
     */
    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String buildToken(String userId, String role, long validityMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);

        var builder = Jwts.builder()
                .subject(userId)
                .issuedAt(now)
                .expiration(expiry);

        if (role != null) {
            builder.claims(Map.of("role", role));
            // Re-set subject because .claims() replaces the payload map
            builder.subject(userId);
        }

        return builder.signWith(secretKey).compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

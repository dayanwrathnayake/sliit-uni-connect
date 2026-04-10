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
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    /** 15 minutes — student access tokens */
    private static final long STUDENT_ACCESS_TOKEN_VALIDITY_MS = 15L * 60 * 1000;

    /** 7 days — student refresh tokens */
    private static final long REFRESH_TOKEN_VALIDITY_MS = 7L * 24 * 60 * 60 * 1000;

    /** 8 hours — staff access tokens (no refresh — re-login required) */
    private static final long STAFF_ACCESS_TOKEN_VALIDITY_MS = 8L * 60 * 60 * 1000;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ── Token generation ──────────────────────────────────────────────────────

    /**
     * Generates an access token.
     *
     * @param userId   MongoDB ObjectId of the user or staff member
     * @param role     Role name (e.g. "STUDENT", "SYSTEM_ADMIN")
     * @param userType "STUDENT" or "STAFF" — tells JwtAuthFilter which repository to query
     */
    public String generateAccessToken(String userId, String role, String userType) {
        long validity = "STAFF".equals(userType)
                ? STAFF_ACCESS_TOKEN_VALIDITY_MS
                : STUDENT_ACCESS_TOKEN_VALIDITY_MS;
        return buildToken(userId, role, userType, validity);
    }

    /**
     * Generates a refresh token (students only — 7 days).
     * userType is embedded so the filter can verify which collection to check.
     */
    public String generateRefreshToken(String userId, String userType) {
        return buildToken(userId, null, userType, REFRESH_TOKEN_VALIDITY_MS);
    }

    // ── Token parsing ─────────────────────────────────────────────────────────

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /**
     * Extracts the userType claim ("STUDENT" or "STAFF").
     * Returns "STUDENT" as a safe default if the claim is absent (legacy tokens).
     */
    public String extractUserType(String token) {
        String userType = parseClaims(token).get("userType", String.class);
        return userType != null ? userType : "STUDENT";
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String buildToken(String userId, String role, String userType, long validityMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);

        Map<String, Object> claims = new HashMap<>();
        if (role != null)     claims.put("role", role);
        if (userType != null) claims.put("userType", userType);

        return Jwts.builder()
                .setSubject(userId)
                .addClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

package com.sliit.uniconnect.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;

public class JwtTest {
    public static void main(String[] args) {
        try {
            // Mock a secret at least 256 bits
            String secret = "this-is-a-very-long-secret-key-for-testing-purposes-1234567890";
            SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            
            String userId = "testUser";
            String role = "STUDENT";
            String userType = "STUDENT";
            long validityMs = 15L * 60 * 1000;
            
            Date now = new Date();
            Date expiry = new Date(now.getTime() + validityMs);

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", role);
            claims.put("userType", userType);

            System.out.println("Trying to build token...");
            String token = Jwts.builder()
                    .setSubject(userId)
                    .setClaims(claims)
                    .setIssuedAt(now)
                    .setExpiration(expiry)
                    .signWith(secretKey)
                    .compact();
                    
            System.out.println("Success! Token: " + token);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

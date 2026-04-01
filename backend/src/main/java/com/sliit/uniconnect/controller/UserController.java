package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.UpdateProfileRequestDTO;
import com.sliit.uniconnect.dto.UserProfileDTO;
import com.sliit.uniconnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── 1. GET /api/users/{userId}/profile — public ───────────────────────────
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDTO> getPublicProfile(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    // ── 2. PUT /api/users/profile — auth required ─────────────────────────────
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO dto) {

        // Extract the authenticated user's ID from the JWT via SecurityContext.
        // Never trust a userId that comes from the request body.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUserId = auth.getName(); // set by JwtAuthFilter as the subject (userId)

        return ResponseEntity.ok(userService.updateProfile(authenticatedUserId, dto));
    }

    // ── 3. GET /api/users/search?query=xxx — auth required ───────────────────
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(
            @RequestParam String query) {

        if (query == null || query.isBlank() || query.length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}

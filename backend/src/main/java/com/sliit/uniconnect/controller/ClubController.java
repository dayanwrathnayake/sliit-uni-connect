package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.model.ClubCategory;
import com.sliit.uniconnect.service.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    // ── Helper: extract userId from JWT (set by JwtAuthFilter as principal name) ─
    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    // ── POST /api/clubs/request — any authenticated student ──────────────────
    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> requestClub(
            @Valid @RequestBody ClubRequestDTO dto) {
        ClubResponseDTO response = clubService.requestClub(currentUserId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/clubs — get all approved clubs (optional ?category= filter) ─
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClubResponseDTO>> getApprovedClubs(
            @RequestParam(required = false) ClubCategory category) {
        return ResponseEntity.ok(clubService.getApprovedClubs(currentUserId(), category));
    }

    // ── GET /api/clubs/pending — SYSTEM_ADMIN only ───────────────────────────
    @GetMapping("/pending")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<ClubResponseDTO>> getPendingClubs() {
        return ResponseEntity.ok(clubService.getPendingClubs(currentUserId()));
    }

    // ── GET /api/clubs/my-club — get the club managed by the current user ────
    @GetMapping("/my-club")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> getMyClub() {
        ClubResponseDTO club = clubService.getMyClub(currentUserId());
        if (club == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(club);
    }

    // ── GET /api/clubs/search?query= ─────────────────────────────────────────
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClubResponseDTO>> searchClubs(
            @RequestParam String query) {
        if (query == null || query.isBlank() || query.length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(clubService.searchClubs(query, currentUserId()));
    }

    // ── GET /api/clubs/{clubId} — single club detail ─────────────────────────
    @GetMapping("/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> getClubById(@PathVariable String clubId) {
        return ResponseEntity.ok(clubService.getClubById(clubId, currentUserId()));
    }

    // ── PUT /api/clubs/{clubId}/approve — SYSTEM_ADMIN approves or rejects ───
    @PutMapping("/{clubId}/approve")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ClubResponseDTO> approveOrRejectClub(
            @PathVariable String clubId,
            @RequestBody ClubApprovalDTO dto) {
        return ResponseEntity.ok(clubService.approveOrRejectClub(currentUserId(), clubId, dto));
    }

    // ── PUT /api/clubs/{clubId} — Club Admin updates club profile ────────────
    @PutMapping("/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> updateClub(
            @PathVariable String clubId,
            @RequestBody ClubUpdateDTO dto) {
        return ResponseEntity.ok(clubService.updateClub(currentUserId(), clubId, dto));
    }

    // ── POST /api/clubs/{clubId}/follow ──────────────────────────────────────
    @PostMapping("/{clubId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> followClub(@PathVariable String clubId) {
        return ResponseEntity.ok(clubService.followClub(currentUserId(), clubId));
    }

    // ── DELETE /api/clubs/{clubId}/follow ────────────────────────────────────
    @DeleteMapping("/{clubId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubResponseDTO> unfollowClub(@PathVariable String clubId) {
        return ResponseEntity.ok(clubService.unfollowClub(currentUserId(), clubId));
    }

    // ── POST /api/clubs/{clubId}/posts — Club Admin creates a post ───────────
    @PostMapping("/{clubId}/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubPostResponseDTO> createPost(
            @PathVariable String clubId,
            @Valid @RequestBody CreatePostDTO dto) {
        ClubPostResponseDTO post = clubService.createPost(currentUserId(), clubId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    // ── GET /api/clubs/{clubId}/posts — get all posts for a club ─────────────
    @GetMapping("/{clubId}/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClubPostResponseDTO>> getClubPosts(@PathVariable String clubId) {
        return ResponseEntity.ok(clubService.getClubPosts(clubId, currentUserId()));
    }

    // ── POST /api/clubs/posts/{postId}/like — toggle like ───────────────────
    @PostMapping("/posts/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClubPostResponseDTO> toggleLike(@PathVariable String postId) {
        return ResponseEntity.ok(clubService.toggleLikePost(currentUserId(), postId));
    }

    // ── DELETE /api/clubs/posts/{postId} — delete a post ────────────────────
    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(@PathVariable String postId) {
        clubService.deletePost(currentUserId(), postId);
        return ResponseEntity.noContent().build();
    }
}

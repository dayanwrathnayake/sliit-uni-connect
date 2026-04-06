package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.service.StaffAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffAuthController {

    private final StaffAuthService staffAuthService;

    private String currentStaffId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName(); // MongoDB ObjectId of the StaffUser
    }

    // ── POST /api/staff/auth/login — public ───────────────────────────────────
    @PostMapping("/auth/login")
    public ResponseEntity<StaffAuthResponseDTO> login(
            @Valid @RequestBody StaffLoginRequestDTO dto) {
        return ResponseEntity.ok(staffAuthService.login(dto));
    }

    // ── POST /api/staff/register — SYSTEM_ADMIN only ─────────────────────────
    // Creates a new Faculty Manager account.
    @PostMapping("/register")
    public ResponseEntity<StaffUserResponseDTO> createFacultyManager(
            @Valid @RequestBody CreateFacultyManagerDTO dto) {
        StaffUserResponseDTO created = staffAuthService.createFacultyManager(currentStaffId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── GET /api/staff/faculty-managers — SYSTEM_ADMIN only ──────────────────
    @GetMapping("/faculty-managers")
    public ResponseEntity<List<StaffUserResponseDTO>> listFacultyManagers() {
        return ResponseEntity.ok(staffAuthService.listFacultyManagers(currentStaffId()));
    }

    // ── DELETE /api/staff/{staffId} — SYSTEM_ADMIN only (soft deactivate) ────
    @DeleteMapping("/{staffId}")
    public ResponseEntity<Void> deactivateStaff(@PathVariable String staffId) {
        staffAuthService.deactivateStaff(currentStaffId(), staffId);
        return ResponseEntity.noContent().build();
    }
}

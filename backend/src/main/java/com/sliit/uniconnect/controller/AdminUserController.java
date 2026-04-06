package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.AdminUserResponseDTO;
import com.sliit.uniconnect.dto.UserStatsDTO;
import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.Role;
import com.sliit.uniconnect.model.User;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final MongoTemplate mongoTemplate;

    // ── GET /api/admin/users ──────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<AdminUserResponseDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String role) {

        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        // Search filter: displayName OR studentId containing (case-insensitive)
        if (search != null && !search.isBlank()) {
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("displayName").regex(search.trim(), "i"),
                    Criteria.where("studentId").regex(search.trim(), "i")
            );
            query.addCriteria(searchCriteria);
        }

        // Faculty filter
        if (faculty != null && !faculty.isBlank()) {
            try {
                FacultyEnum facultyEnum = FacultyEnum.valueOf(faculty.toUpperCase());
                query.addCriteria(Criteria.where("faculty").is(facultyEnum));
            } catch (IllegalArgumentException ignored) {
                // Unknown faculty value — skip filter
            }
        }

        // Role filter
        if (role != null && !role.isBlank()) {
            try {
                Role roleEnum = Role.valueOf(role.toUpperCase());
                query.addCriteria(Criteria.where("role").is(roleEnum));
            } catch (IllegalArgumentException ignored) {
                // Unknown role value — skip filter
            }
        }

        long total = mongoTemplate.count(query, User.class);

        query.with(PageRequest.of(page, size));
        List<User> users = mongoTemplate.find(query, User.class);

        List<AdminUserResponseDTO> dtos = users.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new PageImpl<>(dtos, PageRequest.of(page, size), total));
    }

    // ── GET /api/admin/users/{userId} ─────────────────────────────────────────

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserResponseDTO> getUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return ResponseEntity.ok(toDTO(user));
    }

    // ── PATCH /api/admin/users/{userId}/deactivate ────────────────────────────

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User deactivated"));
    }

    // ── PATCH /api/admin/users/{userId}/activate ──────────────────────────────

    @PatchMapping("/{userId}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User activated"));
    }

    // ── PATCH /api/admin/users/{userId}/verify-email ──────────────────────────

    @PatchMapping("/{userId}/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }

    // ── GET /api/admin/users/stats ────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getStats() {
        long total      = userRepository.count();
        long active     = userRepository.countByIsActiveTrue();
        long inactive   = userRepository.countByIsActiveFalse();
        long verified   = userRepository.countByIsEmailVerifiedTrue();
        long unverified = userRepository.countByIsEmailVerifiedFalse();
        long clubAdmins = userRepository.countByRole(Role.CLUB_ADMIN);

        // Compute per-faculty counts
        List<User> allUsers = userRepository.findAll();
        Map<String, Long> byFaculty = new LinkedHashMap<>();
        for (FacultyEnum f : Arrays.asList(
                FacultyEnum.COMPUTING,
                FacultyEnum.ENGINEERING,
                FacultyEnum.BUSINESS,
                FacultyEnum.HUMANITIES_AND_SCIENCE)) {
            long count = allUsers.stream()
                    .filter(u -> f.equals(u.getFaculty()))
                    .count();
            byFaculty.put(facultyLabel(f), count);
        }

        UserStatsDTO stats = UserStatsDTO.builder()
                .totalStudents(total)
                .activeStudents(active)
                .inactiveStudents(inactive)
                .verifiedStudents(verified)
                .unverifiedStudents(unverified)
                .clubAdmins(clubAdmins)
                .byFaculty(byFaculty)
                .build();

        return ResponseEntity.ok(stats);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private AdminUserResponseDTO toDTO(User u) {
        int followedCount = (int) clubRepository.countByFollowerIdsContaining(u.getId());
        return AdminUserResponseDTO.builder()
                .id(u.getId())
                .studentId(u.getStudentId())
                .displayName(u.getDisplayName())
                .email(u.getEmail())
                .faculty(u.getFaculty() != null ? facultyLabel(u.getFaculty()) : null)
                .department(u.getDepartment())
                .role(u.getRole() != null ? u.getRole().name() : "STUDENT")
                .isActive(u.isActive())
                .isEmailVerified(u.isEmailVerified())
                .profilePicUrl(u.getProfilePicUrl())
                .referralCode(u.getReferralCode())
                .points(u.getPoints())
                .createdAt(u.getCreatedAt())
                .followedClubsCount(followedCount)
                .build();
    }

    private String facultyLabel(FacultyEnum f) {
        return switch (f) {
            case COMPUTING             -> "Computing";
            case ENGINEERING           -> "Engineering";
            case BUSINESS              -> "Business";
            case HUMANITIES_AND_SCIENCE -> "Humanities & Science";
            default                    -> f.name();
        };
    }
}

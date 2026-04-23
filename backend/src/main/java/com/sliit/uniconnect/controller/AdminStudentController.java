package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.AdminUserResponseDTO;
import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.Role;
import com.sliit.uniconnect.model.User;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final MongoTemplate mongoTemplate;

    // ── GET /api/admin/students ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<AdminUserResponseDTO>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String status) {

        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        // Filter by STUDENT role
        query.addCriteria(Criteria.where("role").is(Role.STUDENT));

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
                FacultyEnum facultyEnum = FacultyEnum.valueOf(faculty.toUpperCase().replace(" ", "_"));
                query.addCriteria(Criteria.where("faculty").is(facultyEnum));
            } catch (IllegalArgumentException ignored) {
                // Unknown faculty value — skip filter
            }
        }

        // Status filter (active/inactive)
        if (status != null && !status.isBlank()) {
            if ("true".equalsIgnoreCase(status)) {
                query.addCriteria(Criteria.where("isActive").is(true));
            } else if ("false".equalsIgnoreCase(status)) {
                query.addCriteria(Criteria.where("isActive").is(false));
            }
        }

        long total = mongoTemplate.count(query, User.class);
        query.with(PageRequest.of(page, size));
        List<User> students = mongoTemplate.find(query, User.class);

        List<AdminUserResponseDTO> dtos = students.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new PageImpl<>(dtos, PageRequest.of(page, size), total));
    }

    // ── GET /api/admin/students/{studentId} ────────────────────────────────────

    @GetMapping("/{studentId}")
    public ResponseEntity<AdminUserResponseDTO> getStudent(@PathVariable String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        return ResponseEntity.ok(toDTO(student));
    }

    // ── POST /api/admin/students ────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> createStudent(@RequestBody CreateStudentRequest request) {
        // Validate student ID uniqueness
        if (userRepository.findByStudentId(request.getStudentId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student ID already exists"));
        }

        // Validate email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Create user
        User student = new User();
        student.setStudentId(request.getStudentId());
        student.setDisplayName(request.getDisplayName());
        student.setEmail(request.getEmail());
        student.setPasswordHash(request.getPassword()); // Should be encrypted by service
        student.setRole(request.getRole() != null ? Role.valueOf(request.getRole()) : Role.STUDENT);
        student.setActive(true);
        student.setEmailVerified(false);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        // Detect faculty from student ID prefix
        FacultyEnum detectedFaculty = detectFacultyFromStudentId(request.getStudentId());
        student.setFaculty(detectedFaculty);

        User saved = userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Student created successfully", "studentId", saved.getId()));
    }

    // ── PUT /api/admin/students/{studentId} ────────────────────────────────────

    @PutMapping("/{studentId}")
    public ResponseEntity<Map<String, String>> updateStudent(
            @PathVariable String studentId,
            @RequestBody UpdateStudentRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        if (request.getDisplayName() != null) {
            student.setDisplayName(request.getDisplayName());
        }
        if (request.getRole() != null) {
            student.setRole(Role.valueOf(request.getRole()));
        }
        if (request.getPoints() != null) {
            student.setPoints(request.getPoints());
        }
        if (request.getIsActive() != null) {
            student.setActive(request.getIsActive());
        }

        student.setUpdatedAt(LocalDateTime.now());
        userRepository.save(student);

        return ResponseEntity.ok(Map.of("message", "Student updated successfully"));
    }

    // ── DELETE /api/admin/students/{studentId} ──────────────────────────────────

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        userRepository.delete(student);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // ── PATCH /api/admin/students/{studentId}/deactivate ────────────────────────

    @PatchMapping("/{studentId}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateStudent(@PathVariable String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        student.setActive(false);
        student.setUpdatedAt(LocalDateTime.now());
        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Student deactivated"));
    }

    // ── PATCH /api/admin/students/{studentId}/activate ──────────────────────────

    @PatchMapping("/{studentId}/activate")
    public ResponseEntity<Map<String, String>> activateStudent(@PathVariable String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        student.setActive(true);
        student.setUpdatedAt(LocalDateTime.now());
        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Student activated"));
    }

    // ── PATCH /api/admin/students/{studentId}/verify-email ────────────────────

    @PatchMapping("/{studentId}/verify-email")
    public ResponseEntity<Map<String, String>> verifyStudentEmail(@PathVariable String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        student.setEmailVerified(true);
        student.setEmailVerificationToken(null);
        student.setUpdatedAt(LocalDateTime.now());
        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Student email verified"));
    }

    // ── GET /api/admin/students/stats ──────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStudentStats() {
        List<User> students = userRepository.findByRole(Role.STUDENT);

        long total = students.size();
        long active = students.stream().filter(User::isActive).count();
        long inactive = students.size() - active;
        long verified = students.stream().filter(User::isEmailVerified).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", total);
        stats.put("activeStudents", active);
        stats.put("inactiveStudents", inactive);
        stats.put("verifiedStudents", verified);

        return ResponseEntity.ok(stats);
    }

    // ── Private helper methods ────────────────────────────────────────────────

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

    private FacultyEnum detectFacultyFromStudentId(String studentId) {
        if (studentId == null || studentId.length() < 2) {
            return FacultyEnum.COMPUTING;
        }
        String prefix = studentId.substring(0, 2).toUpperCase();
        return switch (prefix) {
            case "CS" -> FacultyEnum.COMPUTING;
            case "ENG" -> FacultyEnum.ENGINEERING;
            case "BUS" -> FacultyEnum.BUSINESS;
            case "HUM" -> FacultyEnum.HUMANITIES_AND_SCIENCE;
            default -> FacultyEnum.COMPUTING;
        };
    }

    // ── DTOs for Student Creation/Update ──────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateStudentRequest {
        private String studentId;
        private String displayName;
        private String email;
        private String password;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStudentRequest {
        private String displayName;
        private String role;
        private Integer points;
        private Boolean isActive;
    }
}

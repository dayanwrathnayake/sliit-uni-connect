package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.AuthResponseDTO;
import com.sliit.uniconnect.dto.LoginRequestDTO;
import com.sliit.uniconnect.dto.RegisterRequestDTO;
import com.sliit.uniconnect.dto.UserProfileDTO;
import com.sliit.uniconnect.exception.UserNotFoundException;
import com.sliit.uniconnect.model.User;
import com.sliit.uniconnect.repository.UserRepository;
import com.sliit.uniconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/auth/register
     * Registers a new student and returns JWT tokens.
     * Returns HTTP 201 Created.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        AuthResponseDTO response = authService.registerUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Authenticates a student and returns JWT tokens.
     * Returns HTTP 200 OK.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        AuthResponseDTO response = authService.loginUser(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/verify-email?token=xxx
     * Verifies a student's email address via the token sent by email.
     * Returns HTTP 200 OK with a plain success message.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * GET /api/auth/me
     * Returns the profile of the currently authenticated user.
     * Requires a valid Bearer token — protected by SecurityConfig.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getCurrentUser(Authentication authentication) {
        // JwtAuthFilter sets the userId as the principal name
        String userId = authentication.getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        UserProfileDTO profile = UserProfileDTO.builder()
                .id(user.getId())
                .studentId(user.getStudentId())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .faculty(user.getFaculty().name())
                .department(user.getDepartment())
                .referralCode(user.getReferralCode())
                .points(user.getPoints())
                .profilePicUrl(user.getProfilePicUrl())
                .bio(user.getBio())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(profile);
    }
}

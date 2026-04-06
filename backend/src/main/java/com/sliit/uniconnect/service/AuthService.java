package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.AuthResponseDTO;
import com.sliit.uniconnect.dto.LoginRequestDTO;
import com.sliit.uniconnect.dto.RegisterRequestDTO;
import com.sliit.uniconnect.exception.EmailAlreadyExistsException;
import com.sliit.uniconnect.exception.InvalidCredentialsException;
import com.sliit.uniconnect.exception.InvalidStudentIdException;
import com.sliit.uniconnect.exception.StudentIdAlreadyExistsException;
import com.sliit.uniconnect.exception.UserNotFoundException;
import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.Role;
import com.sliit.uniconnect.model.User;
import com.sliit.uniconnect.repository.UserRepository;
import com.sliit.uniconnect.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private static final String REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int REFERRAL_CODE_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ── Register ─────────────────────────────────────────────────────────────

    public AuthResponseDTO registerUser(RegisterRequestDTO dto) {

        // 1. Detect faculty from studentId prefix — throws if unrecognised
        FacultyEnum faculty = detectFaculty(dto.getStudentId());

        // 2. Check email uniqueness
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Email address is already registered: " + dto.getEmail());
        }

        // 3. Check studentId uniqueness
        if (userRepository.existsByStudentId(dto.getStudentId())) {
            throw new StudentIdAlreadyExistsException("Student ID is already registered: " + dto.getStudentId());
        }

        // 4. Hash password
        String passwordHash = passwordEncoder.encode(dto.getPassword());

        // 5. Generate unique referral code
        String referralCode = generateUniqueReferralCode();

        // 6. Validate referredBy code (silently ignore if not found)
        String referredBy = null;
        if (dto.getReferralCode() != null && !dto.getReferralCode().isBlank()) {
            boolean referrerExists = userRepository.findByReferralCode(dto.getReferralCode()).isPresent();
            if (referrerExists) {
                referredBy = dto.getReferralCode();
            } else {
                log.debug("Referral code '{}' not found — ignoring", dto.getReferralCode());
            }
        }

        // 7. Build and save User
        String emailVerificationToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        User user = User.builder()
                .studentId(dto.getStudentId().toUpperCase())
                .email(dto.getEmail().toLowerCase())
                .passwordHash(passwordHash)
                .displayName(dto.getDisplayName())
                .role(Role.STUDENT)
                .faculty(faculty)
                .referralCode(referralCode)
                .referredBy(referredBy)
                .isEmailVerified(false)
                .emailVerificationToken(emailVerificationToken)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);

        // 8. Send verification email asynchronously (never blocks registration)
        emailService.sendVerificationEmail(savedUser.getEmail(), emailVerificationToken);

        // 9. Return tokens
        String accessToken  = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getRole().name(), "STUDENT");
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getId(), "STUDENT");

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .displayName(savedUser.getDisplayName())
                .role(savedUser.getRole().name())
                .faculty(savedUser.getFaculty().name())
                .build();
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponseDTO loginUser(LoginRequestDTO dto) {

        // 1. Find user by email
        User user = userRepository.findByEmail(dto.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // 2. Verify password
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // ADD THIS: block deactivated accounts
        if (!user.isActive()) {
            throw new InvalidCredentialsException("Account is deactivated. Please contact admin.");
        }

        // 3. Generate tokens
        String accessToken  = jwtUtil.generateAccessToken(user.getId(), user.getRole().name(), "STUDENT");
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), "STUDENT");

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .faculty(user.getFaculty().name())
                .build();
    }

    // ── Refresh Token ─────────────────────────────────────────────────────────

    public AuthResponseDTO refreshAccessToken(String refreshToken) {

        // 1. Validate the token
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        // 2. Extract userId from the token
        String userId = jwtUtil.extractUserId(refreshToken);

        // 3. Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // 4. Issue a brand-new access token + refresh token
        String newAccessToken  = jwtUtil.generateAccessToken(userId, user.getRole().name(), "STUDENT");
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, "STUDENT");

        return AuthResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .faculty(user.getFaculty().name())
                .build();
    }

    // ── Email Verification ────────────────────────────────────────────────────

    public String verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new UserNotFoundException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return "Email verified successfully. You can now log in.";
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Maps the student ID prefix to a faculty.
     * Throws InvalidStudentIdException for unrecognised prefixes.
     */
    private FacultyEnum detectFaculty(String studentId) {
        if (studentId == null || studentId.length() < 2) {
            throw new InvalidStudentIdException("Student ID is too short");
        }
        String prefix = studentId.substring(0, 2).toUpperCase();
        return switch (prefix) {
            case "IT" -> FacultyEnum.COMPUTING;
            case "EN" -> FacultyEnum.ENGINEERING;
            case "BM" -> FacultyEnum.BUSINESS;
            case "HS" -> FacultyEnum.HUMANITIES_AND_SCIENCE;
            default   -> throw new InvalidStudentIdException(
                    "Unrecognised student ID prefix '" + prefix + "'. "
                    + "Valid prefixes: IT, EN, BM, HS");
        };
    }

    /**
     * Generates a random 8-character alphanumeric referral code.
     * Loops until a code not already in the database is found.
     */
    private String generateUniqueReferralCode() {
        Random random = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder(REFERRAL_CODE_LENGTH);
            for (int i = 0; i < REFERRAL_CODE_LENGTH; i++) {
                sb.append(REFERRAL_CHARS.charAt(random.nextInt(REFERRAL_CHARS.length())));
            }
            code = sb.toString();
        } while (userRepository.findByReferralCode(code).isPresent());
        return code;
    }
}

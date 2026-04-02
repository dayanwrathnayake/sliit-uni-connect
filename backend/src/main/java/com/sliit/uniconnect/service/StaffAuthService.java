package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.exception.InvalidCredentialsException;
import com.sliit.uniconnect.exception.UnauthorizedClubActionException;
import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.StaffRole;
import com.sliit.uniconnect.model.StaffUser;
import com.sliit.uniconnect.repository.StaffUserRepository;
import com.sliit.uniconnect.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffAuthService {

    private final StaffUserRepository staffUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Authenticates a staff member.
     * Returns an 8-hour access token — no refresh token for staff sessions.
     */
    public StaffAuthResponseDTO login(StaffLoginRequestDTO dto) {
        StaffUser staff = staffUserRepository.findByEmail(dto.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!staff.isActive()) {
            throw new InvalidCredentialsException("This account has been deactivated. Contact your system administrator.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), staff.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Embed userType=STAFF in the JWT so JwtAuthFilter routes to StaffUserRepository
        String accessToken = jwtUtil.generateAccessToken(
                staff.getId(), staff.getRole().name(), "STAFF");

        return StaffAuthResponseDTO.builder()
                .accessToken(accessToken)
                .staffId(staff.getStaffId())
                .displayName(staff.getDisplayName())
                .role(staff.getRole())
                .faculty(staff.getFaculty() != null ? staff.getFaculty().name() : null)
                .build();
    }

    // ── Create Faculty Manager (SYSTEM_ADMIN only) ────────────────────────────

    public StaffUserResponseDTO createFacultyManager(String requestingStaffId,
                                                      CreateFacultyManagerDTO dto) {
        // Verify the caller is a SYSTEM_ADMIN
        StaffUser admin = staffUserRepository.findById(requestingStaffId)
                .orElseThrow(() -> new UnauthorizedClubActionException("Staff account not found"));

        if (admin.getRole() != StaffRole.SYSTEM_ADMIN) {
            throw new UnauthorizedClubActionException(
                    "Only SYSTEM_ADMIN can create Faculty Manager accounts");
        }

        if (staffUserRepository.existsByEmail(dto.getEmail().toLowerCase())) {
            throw new InvalidCredentialsException(
                    "A staff account with email '" + dto.getEmail() + "' already exists");
        }

        String staffId = generateStaffId(dto.getFaculty());
        LocalDateTime now = LocalDateTime.now();

        StaffUser manager = StaffUser.builder()
                .staffId(staffId)
                .email(dto.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .displayName(dto.getDisplayName())
                .role(StaffRole.FACULTY_MANAGER)
                .faculty(dto.getFaculty())
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        StaffUser saved = staffUserRepository.save(manager);
        return toResponseDTO(saved);
    }

    // ── List all Faculty Managers (SYSTEM_ADMIN only) ─────────────────────────

    public List<StaffUserResponseDTO> listFacultyManagers(String requestingStaffId) {
        verifySystemAdmin(requestingStaffId);
        return staffUserRepository.findByRole(StaffRole.FACULTY_MANAGER)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Deactivate a staff account (SYSTEM_ADMIN only) ────────────────────────

    public void deactivateStaff(String requestingStaffId, String targetStaffId) {
        verifySystemAdmin(requestingStaffId);

        StaffUser target = staffUserRepository.findByStaffId(targetStaffId)
                .orElseThrow(() -> new InvalidCredentialsException(
                        "Staff account not found with staffId: " + targetStaffId));

        if (target.getRole() == StaffRole.SYSTEM_ADMIN) {
            throw new UnauthorizedClubActionException("Cannot deactivate a System Admin account");
        }

        target.setActive(false);
        target.setUpdatedAt(LocalDateTime.now());
        staffUserRepository.save(target);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void verifySystemAdmin(String staffId) {
        StaffUser staff = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new UnauthorizedClubActionException("Staff account not found"));
        if (staff.getRole() != StaffRole.SYSTEM_ADMIN) {
            throw new UnauthorizedClubActionException("Only SYSTEM_ADMIN can perform this action");
        }
    }

    private String generateStaffId(FacultyEnum faculty) {
        String prefix = switch (faculty) {
            case COMPUTING            -> "FAC-CS";
            case ENGINEERING          -> "FAC-ENG";
            case BUSINESS             -> "FAC-BUS";
            case HUMANITIES_AND_SCIENCE -> "FAC-HS";
            default                   -> "FAC-UNK";
        };

        // Count existing managers for this faculty and increment
        long count = staffUserRepository.findByFaculty(faculty).size() + 1;
        return String.format("%s-%03d", prefix, count);
    }

    private StaffUserResponseDTO toResponseDTO(StaffUser staff) {
        return StaffUserResponseDTO.builder()
                .id(staff.getId())
                .staffId(staff.getStaffId())
                .displayName(staff.getDisplayName())
                .email(staff.getEmail())
                .role(staff.getRole())
                .faculty(staff.getFaculty())
                .isActive(staff.isActive())
                .createdAt(staff.getCreatedAt())
                .build();
    }
}

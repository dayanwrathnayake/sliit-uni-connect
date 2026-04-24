package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.UpdateProfileRequestDTO;
import com.sliit.uniconnect.dto.UserProfileDTO;
import com.sliit.uniconnect.exception.UserNotFoundException;
import com.sliit.uniconnect.model.Club;
import com.sliit.uniconnect.model.User;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    // ── Map User → UserProfileDTO ─────────────────────────────────────────────
    private UserProfileDTO toProfileDTO(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .studentId(user.getStudentId())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .faculty(user.getFaculty() != null ? user.getFaculty().name() : null)
                .department(user.getDepartment())
                .referralCode(user.getReferralCode())
                .points(user.getPoints())
                .profilePicUrl(user.getProfilePicUrl())
                .bio(user.getBio())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ── 1. Get any user's public profile ─────────────────────────────────────
    public UserProfileDTO getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return toProfileDTO(user);
    }

    // ── 2. Update the authenticated user's own profile ────────────────────────
    public UserProfileDTO updateProfile(String authenticatedUserId, UpdateProfileRequestDTO dto) {
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found"));

        // Partial update — only apply non-null fields from the request
        if (dto.getDisplayName() != null && !dto.getDisplayName().isBlank()) {
            user.setDisplayName(dto.getDisplayName().trim());
        }
        if (dto.getBio() != null) {
            // Allow clearing bio by passing empty string
            user.setBio(dto.getBio().trim());
        }
        if (dto.getDepartment() != null) {
            user.setDepartment(dto.getDepartment().trim());
        }
        if (dto.getProfilePicUrl() != null && !dto.getProfilePicUrl().isBlank()) {
            user.setProfilePicUrl(dto.getProfilePicUrl().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        return toProfileDTO(saved);
    }

    // ── 3. Delete the authenticated user's own account ───────────────────────
    // If the user owns a club (is a CLUB_ADMIN), that club is also deleted.
    public Map<String, Object> deleteOwnAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        boolean clubDeleted = false;
        String deletedClubName = null;

        Optional<Club> ownedClub = clubRepository.findByAdminId(userId);
        if (ownedClub.isPresent()) {
            deletedClubName = ownedClub.get().getName();
            clubRepository.delete(ownedClub.get());
            clubDeleted = true;
        }

        userRepository.delete(user);

        return Map.of(
                "message", "Account deleted successfully",
                "clubDeleted", clubDeleted,
                "deletedClubName", deletedClubName != null ? deletedClubName : ""
        );
    }

    // ── 4. Search users by name or student ID ────────────────────────────────
    public List<UserProfileDTO> searchUsers(String query) {
        return userRepository
                .findByDisplayNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(query, query)
                .stream()
                .limit(10)
                .map(this::toProfileDTO)
                .collect(Collectors.toList());
    }
}

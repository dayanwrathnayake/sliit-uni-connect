package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.*;
import com.sliit.uniconnect.exception.*;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.ClubPostRepository;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.repository.StaffUserRepository;
import com.sliit.uniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubPostRepository clubPostRepository;
    private final UserRepository userRepository;
    private final StaffUserRepository staffUserRepository;
    // ADD: notification dispatch
    private final NotificationService notificationService;
    private final ChatService chatService;

    // ── DTO Mappers ───────────────────────────────────────────────────────────

    private ClubResponseDTO toResponseDTO(Club club, String authenticatedUserId) {
        boolean isFollowing = authenticatedUserId != null
                && club.getFollowerIds().contains(authenticatedUserId);
        boolean isAdmin = authenticatedUserId != null
                && (authenticatedUserId.equals(club.getAdminId()) || isSystemAdmin(authenticatedUserId));

        return ClubResponseDTO.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .category(club.getCategory())
                .status(club.getStatus())
                .adminId(club.getAdminId())
                .adminName(club.getAdminName())
                .profilePicUrl(club.getProfilePicUrl())
                .bannerUrl(club.getBannerUrl())
                .followerCount(club.getFollowerCount())
                .faculty(club.getFaculty())
                .rejectionReason(club.getRejectionReason())
                .createdAt(club.getCreatedAt())
                .isFollowing(isFollowing)
                .isAdmin(isAdmin)
                .build();
    }

    private ClubPostResponseDTO toPostResponseDTO(ClubPost post, String authenticatedUserId) {
        List<String> liked = post.getLikedByIds() != null ? post.getLikedByIds() : List.of();
        boolean isLikedByMe = authenticatedUserId != null
                && liked.contains(authenticatedUserId);

        return ClubPostResponseDTO.builder()
                .id(post.getId())
                .clubId(post.getClubId())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .authorAvatarUrl(post.getAuthorAvatarUrl())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .likeCount(post.getLikeCount())
                .createdAt(post.getCreatedAt())
                .isLikedByMe(isLikedByMe)
                .build();
    }

    // ── 1. Request club creation ──────────────────────────────────────────────

    public ClubResponseDTO requestClub(String requestingUserId, ClubRequestDTO dto) {
        if (clubRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new ClubNameAlreadyExistsException(
                    "A club with the name '" + dto.getName() + "' already exists.");
        }

        String adminName = userRepository.findById(requestingUserId)
                .map(User::getDisplayName)
                .orElse("Unknown");

        Club club = Club.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .status(ClubStatus.PENDING)
                .adminId(requestingUserId)
                .adminName(adminName)
                .profilePicUrl(dto.getProfilePicUrl())
                .bannerUrl(dto.getBannerUrl())
                .faculty(dto.getFaculty())
                .requestedBy(requestingUserId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Club saved = clubRepository.save(club);
        return toResponseDTO(saved, requestingUserId);
    }

    // ── 2. Approve or reject a pending club ───────────────────────────────────
    // SYSTEM_ADMIN: can approve/reject ANY club.
    // FACULTY_MANAGER: can only approve/reject clubs whose faculty matches their own.

    public ClubResponseDTO approveOrRejectClub(String staffUserId, String clubId, ClubApprovalDTO dto) {
        StaffUser staff = staffUserRepository.findById(staffUserId)
                .orElseThrow(() -> new UnauthorizedClubActionException(
                        "Staff account not found"));

        Club club = findClubOrThrow(clubId);

        // Faculty Manager can only act on clubs in their own faculty
        if (staff.getRole() == StaffRole.FACULTY_MANAGER) {
            if (club.getFaculty() == null || club.getFaculty() != staff.getFaculty()) {
                throw new UnauthorizedClubActionException(
                        "Faculty Managers can only approve/reject clubs in their own faculty.");
            }
        } else if (staff.getRole() != StaffRole.SYSTEM_ADMIN) {
            throw new UnauthorizedClubActionException(
                    "Only SYSTEM_ADMIN or FACULTY_MANAGER can approve/reject clubs.");
        }

        if (dto.isApproved()) {
            club.setStatus(ClubStatus.APPROVED);
            club.setRejectionReason(null);

            // Upgrade the club's student admin to CLUB_ADMIN role
            userRepository.findById(club.getAdminId()).ifPresent(user -> {
                user.setRole(Role.CLUB_ADMIN);
                userRepository.save(user);
            });
        } else {
            club.setStatus(ClubStatus.REJECTED);
            club.setRejectionReason(dto.getRejectionReason());
        }

        club.setUpdatedAt(LocalDateTime.now());
        Club saved = clubRepository.save(club);

        if (dto.isApproved()) {
            // Create the official club chat room immediately
            chatService.createOrGetChatRoom(saved.getId(), saved.getName() + " Official", saved.getAdminId(), com.sliit.uniconnect.model.RoomType.CLUB);
        }

        // ADD: notify the student who requested the club
        if (dto.isApproved()) {
            notificationService.sendNotification(
                    saved.getRequestedBy(),
                    "CLUB_APPROVED",
                    "Your club '" + saved.getName() + "' has been approved! You are now a Club Admin.",
                    "/clubs/" + saved.getId(),
                    saved.getName(),
                    saved.getProfilePicUrl()
            );
        } else {
            notificationService.sendNotification(
                    saved.getRequestedBy(),
                    "CLUB_REJECTED",
                    "Your club request '" + saved.getName() + "' was rejected. Reason: " + dto.getRejectionReason(),
                    "/clubs",
                    "SLIIT UNI-Connect",
                    null
            );
        }

        return toResponseDTO(saved, staffUserId);
    }

    // ── 3. Get all approved clubs ─────────────────────────────────────────────

    public List<ClubResponseDTO> getApprovedClubs(String authenticatedUserId, ClubCategory category) {
        List<Club> clubs;
        if (category != null) {
            clubs = clubRepository.findByStatusAndCategory(ClubStatus.APPROVED, category);
        } else {
            clubs = clubRepository.findByStatusOrderByFollowerCountDesc(ClubStatus.APPROVED);
        }
        return clubs.stream()
                .map(c -> toResponseDTO(c, authenticatedUserId))
                .collect(Collectors.toList());
    }

    // ── 4. Get single club by ID ──────────────────────────────────────────────

    public ClubResponseDTO getClubById(String clubId, String authenticatedUserId) {
        Club club = findClubOrThrow(clubId);
        return toResponseDTO(club, authenticatedUserId);
    }

    // ── 5. Update club profile (Club Admin only) ──────────────────────────────

    public ClubResponseDTO updateClub(String authenticatedUserId, String clubId, ClubUpdateDTO dto) {
        Club club = findClubOrThrow(clubId);
        verifyClubAdmin(authenticatedUserId, club);

        if (dto.getDescription() != null) club.setDescription(dto.getDescription());
        if (dto.getProfilePicUrl() != null) club.setProfilePicUrl(dto.getProfilePicUrl());
        if (dto.getBannerUrl() != null) club.setBannerUrl(dto.getBannerUrl());

        club.setUpdatedAt(LocalDateTime.now());
        Club saved = clubRepository.save(club);
        return toResponseDTO(saved, authenticatedUserId);
    }

    // ── 6. Follow a club ─────────────────────────────────────────────────────

    public ClubResponseDTO followClub(String userId, String clubId) {
        Club club = findClubOrThrow(clubId);

        if (club.getStatus() != ClubStatus.APPROVED) {
            throw new ClubNotApprovedException("You can only follow approved clubs.");
        }

        if (!club.getFollowerIds().contains(userId)) {
            club.getFollowerIds().add(userId);
            club.setFollowerCount(club.getFollowerIds().size());
            club.setUpdatedAt(LocalDateTime.now());
            clubRepository.save(club);

            // ADD: notify the club admin about new follower
            User follower = userRepository.findById(userId).orElse(null);
            String followerName = follower != null ? follower.getDisplayName() : "A student";
            String followerPic  = follower != null ? follower.getProfilePicUrl() : null;
            notificationService.sendNotification(
                    club.getAdminId(),
                    "NEW_FOLLOWER",
                    followerName + " started following " + club.getName(),
                    "/clubs/" + clubId,
                    followerName,
                    followerPic
            );
        }

        return toResponseDTO(club, userId);
    }

    // ── 7. Unfollow a club ───────────────────────────────────────────────────

    public ClubResponseDTO unfollowClub(String userId, String clubId) {
        Club club = findClubOrThrow(clubId);

        club.getFollowerIds().remove(userId);
        club.setFollowerCount(Math.max(0, club.getFollowerIds().size()));
        club.setUpdatedAt(LocalDateTime.now());
        clubRepository.save(club);

        return toResponseDTO(club, userId);
    }

    // ── 8. Search clubs by name ───────────────────────────────────────────────

    public List<ClubResponseDTO> searchClubs(String query, String authenticatedUserId) {
        return clubRepository
                .findByNameContainingIgnoreCaseAndStatus(query, ClubStatus.APPROVED)
                .stream()
                .limit(10)
                .map(c -> toResponseDTO(c, authenticatedUserId))
                .collect(Collectors.toList());
    }

    // ── 9. Get all pending club requests ─────────────────────────────────────
    // SYSTEM_ADMIN sees all pending.
    // FACULTY_MANAGER sees only pending clubs in their faculty.

    public List<ClubResponseDTO> getPendingClubs(String staffUserId) {
        StaffUser staff = staffUserRepository.findById(staffUserId)
                .orElseThrow(() -> new UnauthorizedClubActionException("Staff account not found"));

        List<Club> pending;
        if (staff.getRole() == StaffRole.SYSTEM_ADMIN) {
            pending = clubRepository.findByStatus(ClubStatus.PENDING);
        } else if (staff.getRole() == StaffRole.FACULTY_MANAGER) {
            pending = clubRepository.findByStatusAndFaculty(ClubStatus.PENDING, staff.getFaculty());
        } else {
            throw new UnauthorizedClubActionException(
                    "Only staff members can view pending clubs.");
        }

        return pending.stream()
                .map(c -> toResponseDTO(c, staffUserId))
                .collect(Collectors.toList());
    }

    // ── 10. Get the club managed by a student admin ───────────────────────────

    public ClubResponseDTO getMyClub(String adminUserId) {
        return clubRepository.findByAdminId(adminUserId)
                .map(c -> toResponseDTO(c, adminUserId))
                .orElse(null);
    }

    // ── 11. Create a post on a club page (Club Admin only) ────────────────────

    public ClubPostResponseDTO createPost(String authorId, String clubId, CreatePostDTO dto) {
        Club club = findClubOrThrow(clubId);

        if (club.getStatus() != ClubStatus.APPROVED) {
            throw new ClubNotApprovedException("Posts can only be created on approved clubs.");
        }
        verifyClubAdmin(authorId, club);

        // AFTER: posts are published under the club's identity, not the individual admin's name
        ClubPost post = ClubPost.builder()
                .clubId(clubId)
                .authorId(authorId)
                .authorName(club.getName())
                .authorAvatarUrl(club.getProfilePicUrl())
                .content(dto.getContent())
                .imageUrl(dto.getImageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ClubPost saved = clubPostRepository.save(post);

        // ADD: notify all club followers about the new post
        String postPreview = truncate(dto.getContent(), 60);
        for (String followerId : club.getFollowerIds()) {
            notificationService.sendNotification(
                    followerId,
                    "NEW_CLUB_POST",
                    club.getName() + " posted: " + postPreview,
                    "/clubs/" + clubId,
                    club.getName(),
                    club.getProfilePicUrl()
            );
        }

        return toPostResponseDTO(saved, authorId);
    }

    // ── 12. Update a post (Club Admin only) ──────────────────────────────────

    public ClubPostResponseDTO updatePost(String requestingUserId, String clubId, String postId, CreatePostDTO dto) {
        Club club = findClubOrThrow(clubId);
        verifyClubAdmin(requestingUserId, club);

        ClubPost post = clubPostRepository.findById(postId)
                .orElseThrow(() -> new ClubNotFoundException("Post not found with id: " + postId));

        if (!clubId.equals(post.getClubId())) {
            throw new UnauthorizedClubActionException("Post does not belong to this club.");
        }

        post.setContent(dto.getContent());
        // Empty string means "remove the image"; null means "leave it unchanged"
        if (dto.getImageUrl() != null) {
            post.setImageUrl(dto.getImageUrl().isEmpty() ? null : dto.getImageUrl());
        }
        // Repair legacy documents that were stored without likedByIds
        if (post.getLikedByIds() == null) {
            post.setLikedByIds(new java.util.ArrayList<>());
        }
        post.setUpdatedAt(LocalDateTime.now());

        ClubPost saved = clubPostRepository.save(post);
        return toPostResponseDTO(saved, requestingUserId);
    }

    // ── 14 (was 12). Get all posts for a club ────────────────────────────────

    public List<ClubPostResponseDTO> getClubPosts(String clubId, String authenticatedUserId) {
        findClubOrThrow(clubId);
        return clubPostRepository.findByClubIdOrderByCreatedAtDesc(clubId)
                .stream()
                .map(p -> toPostResponseDTO(p, authenticatedUserId))
                .collect(Collectors.toList());
    }

    // ── 13. Toggle like on a post ─────────────────────────────────────────────

    public ClubPostResponseDTO toggleLikePost(String userId, String postId) {
        ClubPost post = clubPostRepository.findById(postId)
                .orElseThrow(() -> new ClubNotFoundException("Post not found with id: " + postId));

        // Guard against legacy documents that have null likedByIds
        if (post.getLikedByIds() == null) {
            post.setLikedByIds(new java.util.ArrayList<>());
        }

        boolean isAdding = !post.getLikedByIds().contains(userId);

        if (!isAdding) {
            post.getLikedByIds().remove(userId);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            post.getLikedByIds().add(userId);
            post.setLikeCount(post.getLikeCount() + 1);
        }

        post.setUpdatedAt(LocalDateTime.now());
        ClubPost saved = clubPostRepository.save(post);

        // ADD: notify club admin when someone likes their post (not on unlike)
        if (isAdding) {
            clubRepository.findById(post.getClubId()).ifPresent(club -> {
                User liker = userRepository.findById(userId).orElse(null);
                String likerName = liker != null ? liker.getDisplayName() : "A student";
                String likerPic  = liker != null ? liker.getProfilePicUrl() : null;
                notificationService.sendNotification(
                        club.getAdminId(),
                        "CLUB_POST_LIKED",
                        likerName + " liked your post in " + club.getName(),
                        "/clubs/" + club.getId(),
                        likerName,
                        likerPic
                );
            });
        }

        return toPostResponseDTO(saved, userId);
    }

    // ── 14. Delete a post ─────────────────────────────────────────────────────

    public void deletePost(String requestingUserId, String postId) {
        ClubPost post = clubPostRepository.findById(postId)
                .orElseThrow(() -> new ClubNotFoundException("Post not found with id: " + postId));

        boolean isAuthor = requestingUserId.equals(post.getAuthorId());

        // Current club admin can always delete posts in their club
        boolean isCurrentClubAdmin = post.getClubId() != null
                && clubRepository.findById(post.getClubId())
                        .map(club -> requestingUserId.equals(club.getAdminId()))
                        .orElse(false);

        // System admins can delete any post
        boolean isSystemAdmin = staffUserRepository.findById(requestingUserId)
                .map(s -> s.getRole() == StaffRole.SYSTEM_ADMIN)
                .orElse(false);

        if (!isAuthor && !isCurrentClubAdmin && !isSystemAdmin) {
            throw new UnauthorizedClubActionException(
                    "You do not have permission to delete this post.");
        }

        clubPostRepository.delete(post);
    }

    // ── 15. Delete a club (club admin or system admin) ───────────────────────
    public void deleteClub(String requestingUserId, String clubId) {
        Club club = findClubOrThrow(clubId);

        if (!club.getAdminId().equals(requestingUserId) && !isSystemAdmin(requestingUserId)) {
            throw new UnauthorizedClubActionException(
                    "Only the club owner or system admin can delete this club.");
        }

        // Remove all posts belonging to this club
        clubPostRepository.deleteByClubId(clubId);

        // Revert the club admin's role back to STUDENT
        userRepository.findById(club.getAdminId()).ifPresent(user -> {
            user.setRole(Role.STUDENT);
            userRepository.save(user);
        });

        clubRepository.delete(club);
    }

    // ── 16. Get all clubs for admin (all statuses) ────────────────────────────
    public List<ClubResponseDTO> getAllClubsForAdmin(String adminUserId) {
        List<Club> clubs = clubRepository.findAll();
        clubs.sort((a, b) -> {
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return clubs.stream()
                .map(c -> toResponseDTO(c, adminUserId))
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Club findClubOrThrow(String clubId) {
        return clubRepository.findById(clubId)
                .orElseThrow(() -> new ClubNotFoundException("Club not found with id: " + clubId));
    }

    private void verifyClubAdmin(String userId, Club club) {
        if (userId == null || (!userId.equals(club.getAdminId()) && !isSystemAdmin(userId))) {
            throw new UnauthorizedClubActionException(
                    "Only the club admin can perform this action.");
        }
    }

    private boolean isSystemAdmin(String userId) {
        return staffUserRepository.findById(userId)
                .map(s -> s.getRole() == StaffRole.SYSTEM_ADMIN)
                .orElse(false);
    }

    // ADD: truncate helper for notification messages
    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}

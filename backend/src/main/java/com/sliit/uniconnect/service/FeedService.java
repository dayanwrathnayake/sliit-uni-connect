package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.FeedPostResponseDTO;
import com.sliit.uniconnect.model.Club;
import com.sliit.uniconnect.model.ClubPost;
import com.sliit.uniconnect.model.ClubStatus;
import com.sliit.uniconnect.repository.ClubPostRepository;
import com.sliit.uniconnect.repository.ClubRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedService {

    private final ClubPostRepository clubPostRepository;
    private final ClubRepository clubRepository;

    public FeedService(ClubPostRepository clubPostRepository,
                       ClubRepository clubRepository) {
        this.clubPostRepository = clubPostRepository;
        this.clubRepository = clubRepository;
    }

    /**
     * Returns a paginated feed of posts from clubs the user follows.
     *
     * Follow tracking is stored in Club.followerIds (List<String> of userIds).
     * We find all APPROVED clubs that contain currentUserId in their followerIds list,
     * then fetch posts from those clubs sorted by createdAt DESC.
     *
     * @param currentUserId MongoDB _id of the authenticated student
     * @param page          zero-based page index
     * @param size          number of posts per page
     */
    public Page<FeedPostResponseDTO> getFeed(String currentUserId, int page, int size) {

        // 1. Find all approved clubs the user follows
        List<Club> allApproved = clubRepository.findByStatus(ClubStatus.APPROVED);
        List<Club> followedClubs = allApproved.stream()
                .filter(club -> club.getFollowerIds() != null
                        && club.getFollowerIds().contains(currentUserId))
                .collect(Collectors.toList());

        if (followedClubs.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(),
                    PageRequest.of(page, size), 0);
        }

        // 2. Build a lookup map: clubId → Club (for enriching posts)
        Map<String, Club> clubMap = followedClubs.stream()
                .collect(Collectors.toMap(Club::getId, c -> c));

        List<String> followedClubIds = followedClubs.stream()
                .map(Club::getId)
                .collect(Collectors.toList());

        // 3. Fetch all posts from those clubs, sorted newest-first
        List<ClubPost> allPosts = clubPostRepository
                .findByClubIdInOrderByCreatedAtDesc(followedClubIds);

        // 4. Map to DTOs (with likedByCurrentUser check)
        List<FeedPostResponseDTO> dtos = allPosts.stream().map(post -> {
            Club club = clubMap.get(post.getClubId());
            boolean liked = post.getLikedByIds() != null
                    && post.getLikedByIds().contains(currentUserId);

            return FeedPostResponseDTO.builder()
                    .postId(post.getId())
                    .content(post.getContent())
                    .imageUrl(post.getImageUrl())
                    .likeCount(post.getLikeCount())
                    .likedByCurrentUser(liked)
                    .createdAt(post.getCreatedAt())
                    .clubId(post.getClubId())
                    .clubName(club != null ? club.getName() : "Unknown Club")
                    .clubProfilePicUrl(club != null ? club.getProfilePicUrl() : null)
                    .clubCategory(club != null && club.getCategory() != null
                            ? club.getCategory().name() : null)
                    .build();
        }).collect(Collectors.toList());

        // 5. Manual pagination on the in-memory list
        int total = dtos.size();
        int fromIndex = page * size;
        if (fromIndex >= total) {
            return new PageImpl<>(Collections.emptyList(),
                    PageRequest.of(page, size), total);
        }
        int toIndex = Math.min(fromIndex + size, total);
        List<FeedPostResponseDTO> pageContent = dtos.subList(fromIndex, toIndex);

        return new PageImpl<>(pageContent, PageRequest.of(page, size), total);
    }
}

package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedPostResponseDTO {

    private String postId;
    private String content;
    private String imageUrl;
    private int likeCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;

    // Club info — denormalised for fast rendering
    private String clubId;
    private String clubName;
    private String clubProfilePicUrl;
    private String clubCategory;
}

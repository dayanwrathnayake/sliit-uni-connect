package com.sliit.uniconnect.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubPostResponseDTO {

    private String id;
    private String clubId;
    private String authorId;
    private String authorName;
    private String authorAvatarUrl;
    private String content;
    private String imageUrl;
    private int likeCount;
    private LocalDateTime createdAt;

    /** True if the currently authenticated user has liked this post. */
    @JsonProperty("isLikedByMe")
    private boolean isLikedByMe;
}

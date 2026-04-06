package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "club_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubPost {

    @Id
    private String id;

    @Indexed
    private String clubId;

    /** userId of the author — must match club.adminId at creation time. */
    private String authorId;

    /** Denormalised for fast display without extra user lookups. */
    private String authorName;

    private String authorAvatarUrl;

    private String content;

    private String imageUrl;

    @Builder.Default
    private int likeCount = 0;

    @Builder.Default
    private List<String> likedByIds = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

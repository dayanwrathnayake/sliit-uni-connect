package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.ClubCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubSummaryDTO {

    private String id;
    private String name;
    private ClubCategory category;
    private String profilePicUrl;
    private int followerCount;

    /** True if the currently authenticated user follows this club. */
    private boolean isFollowing;
}

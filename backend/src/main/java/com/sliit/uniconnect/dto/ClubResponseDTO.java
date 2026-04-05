package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.ClubCategory;
import com.sliit.uniconnect.model.ClubStatus;
import com.sliit.uniconnect.model.FacultyEnum;
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
public class ClubResponseDTO {

    private String id;
    private String name;
    private String description;
    private ClubCategory category;
    private ClubStatus status;
    private String adminId;
    private String adminName;
    private String profilePicUrl;
    private String bannerUrl;
    private int followerCount;
    private FacultyEnum faculty;
    private String rejectionReason;
    private LocalDateTime createdAt;

    /** True if the currently authenticated user follows this club. */
    @JsonProperty("isFollowing")
    private boolean isFollowing;

    /** True if the currently authenticated user is the admin of this club. */
    @JsonProperty("isAdmin")
    private boolean isAdmin;
}

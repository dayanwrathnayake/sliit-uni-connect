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

@Document(collection = "clubs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Club {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    private ClubCategory category;

    @Builder.Default
    private ClubStatus status = ClubStatus.PENDING;

    /** userId of the Club Admin — the single person who manages this club. */
    private String adminId;

    /** Denormalised displayName of the admin — avoids extra DB lookups on reads. */
    private String adminName;

    private String profilePicUrl;

    private String bannerUrl;

    /** List of userIds who follow this club. Kept in sync with followerCount. */
    @Builder.Default
    private List<String> followerIds = new ArrayList<>();

    /** Cached count of followerIds — indexed so we can sort by popularity. */
    @Indexed
    @Builder.Default
    private int followerCount = 0;

    /** Only populated for FACULTY_MEDIA clubs. */
    private FacultyEnum faculty;

    /** Filled by the System Admin when the club request is rejected. */
    private String rejectionReason;

    /** userId who originally submitted the creation request. */
    private String requestedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

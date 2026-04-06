package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    /** MongoDB _id of the target user (from users collection) */
    private String recipientUserId;

    /** "NEW_CLUB_POST" | "CLUB_APPROVED" | "CLUB_REJECTED" | "NEW_FOLLOWER" | "CLUB_POST_LIKED" */
    private String type;

    /** Human-readable notification text */
    private String message;

    /** Frontend route to navigate to on click */
    private String link;

    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;

    /** Who triggered it (club name or student name) */
    private String actorName;

    /** Profile pic URL of the actor (club or student) */
    private String actorImageUrl;
}

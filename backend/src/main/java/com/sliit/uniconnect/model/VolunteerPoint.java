package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "volunteer_points")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerPoint {

    @Id
    private String id;
    private String volunteerApplicationId;
    private String taskId;
    private String userId;
    private String eventId;
    private int points;
    private PointRating rating;
    private LocalDateTime awardedAt;

    @org.springframework.data.annotation.Transient
    private String userName;

    @org.springframework.data.annotation.Transient
    private String userStudentId;
}

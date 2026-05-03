package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "volunteer_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerApplication {

    @Id
    private String id;
    private String userId;
    private String eventId;
    private String registrationNumber; // auto-filled from User.studentId
    private String year;
    private String semester;
    private VolunteerCategory category;
    private HoursType hoursType;
    private String description; // optional, required only if category=OTHER
    private VolunteerStatus status;
    private LocalDateTime appliedAt;
    private FacultyEnum faculty; // from user's faculty

    @org.springframework.data.annotation.Transient
    private String userName;

    @org.springframework.data.annotation.Transient
    private String userStudentId;
}

package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "volunteer_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerTask {

    @Id
    private String id;
    private String volunteerApplicationId;
    private String eventId;
    private String assignedBy; // club admin userId
    private String assignedTo; // volunteer userId
    private String taskDescription;
    private TaskStatus status;
    private LocalDateTime completedAt;
}

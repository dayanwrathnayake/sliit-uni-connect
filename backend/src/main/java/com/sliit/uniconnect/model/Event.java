package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;
    private String title;
    private String description;
    private EventType type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String venue;
    private Integer capacity;
    private String imageUrl;
    
    @Builder.Default
    private FacultyScope facultyScope = FacultyScope.ALL_FACULTIES;
    
    private FacultyEnum faculty; // Optional, used when facultyScope is SPECIFIC_FACULTY

    
    @Builder.Default
    private Integer registeredCount = 0;
    
    private String clubId;
    private String createdBy;
    private EventStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private List<String> registeredUserIds = new java.util.ArrayList<>();
    
    @Builder.Default
    private List<EventApproval> approvals = new java.util.ArrayList<>();
}

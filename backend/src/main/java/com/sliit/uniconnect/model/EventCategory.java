package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "event_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCategory {
    @Id
    private String id;
    private String name;
    private String description;
    private String colorCode;
    private Boolean isActive;
}

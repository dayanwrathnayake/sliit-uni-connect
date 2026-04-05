package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private String id;
    private String type;
    private String message;
    private String link;
    private boolean isRead;
    private String createdAt;   // ISO-8601 formatted string
    private String actorName;
    private String actorImageUrl;
}

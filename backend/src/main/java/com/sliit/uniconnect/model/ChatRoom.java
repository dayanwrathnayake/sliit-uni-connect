package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "chat_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    private String id;
    private String name;
    private RoomType type;
    private String referenceId; // eventId or clubId
    private String createdBy;
    private LocalDateTime createdAt;
    private List<String> memberIds;
    private Boolean isActive;
}

package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.model.ChatRoom;
import com.sliit.uniconnect.model.Message;
import com.sliit.uniconnect.model.RoomType;
import com.sliit.uniconnect.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping("/rooms/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatRoom> getEventChatRoom(
            @PathVariable String eventId, @RequestParam String eventName) {
        return ResponseEntity.ok(chatService.createOrGetChatRoom(eventId, eventName, currentUserId(), RoomType.EVENT));
    }

    @GetMapping("/rooms/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChatRoom>> getMyChatRooms() {
        return ResponseEntity.ok(chatService.getMyChatRooms(currentUserId()));
    }

    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Slice<Message>> getChatHistory(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getChatHistory(roomId, page, size, currentUserId()));
    }
}

package com.sliit.uniconnect.service;

import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.ChatRoomRepository;
import com.sliit.uniconnect.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── 1. Create or Get Chat Room ──────────────────────────────────────────

    public ChatRoom createOrGetChatRoom(String referenceId, String name, String creatorId, RoomType type) {
        return chatRoomRepository.findByTypeAndReferenceId(type, referenceId)
                .orElseGet(() -> {
                    ChatRoom newRoom = ChatRoom.builder()
                            .name(name)
                            .type(type)
                            .referenceId(referenceId)
                            .createdBy(creatorId)
                            .createdAt(LocalDateTime.now())
                            .memberIds(new java.util.ArrayList<>(java.util.List.of(creatorId)))
                            .isActive(true)
                            .build();
                    return chatRoomRepository.save(newRoom);
                });
    }

    public java.util.Optional<ChatRoom> findRoomByTypeAndReferenceId(RoomType type, String referenceId) {
        return chatRoomRepository.findByTypeAndReferenceId(type, referenceId);
    }

    // ── 2. Join Chat Room ───────────────────────────────────────────────────

    public void joinChatRoom(String roomId, String userId, String userName) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (!room.getMemberIds().contains(userId)) {
            room.getMemberIds().add(userId);
            chatRoomRepository.save(room);

            // Send system message
            sendSystemMessage(roomId, userName + " joined the chat");
        }
    }

    // ── 3. Leave Chat Room ──────────────────────────────────────────────────

    public void leaveChatRoom(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (room.getMemberIds().remove(userId)) {
            chatRoomRepository.save(room);
        }
    }

    // ── 4. Send Message ─────────────────────────────────────────────────────

    public Message sendMessage(String roomId, String userId, String userName, String content) {
        Message message = Message.builder()
                .roomId(roomId)
                .senderId(userId)
                .senderName(userName)
                .content(content)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .type(MessageType.TEXT)
                .build();

        Message saved = messageRepository.save(message);

        // Broadcast to WebSocket topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);

        return saved;
    }

    // ── 5. Get Chat History ─────────────────────────────────────────────────

    public Slice<Message> getChatHistory(String roomId, int page, int size, String userId) {
        return messageRepository.findByRoomIdOrderByTimestampDesc(roomId, PageRequest.of(page, size));
    }

    // ── 6. Get My Chat Rooms ────────────────────────────────────────────────

    public List<ChatRoom> getMyChatRooms(String userId) {
        return chatRoomRepository.findByMemberIdsContains(userId);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private void sendSystemMessage(String roomId, String content) {
        Message systemMsg = Message.builder()
                .roomId(roomId)
                .content(content)
                .timestamp(LocalDateTime.now())
                .type(MessageType.SYSTEM)
                .build();

        Message saved = messageRepository.save(systemMsg);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);
    }
}

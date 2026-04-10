package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.model.Message;
import com.sliit.uniconnect.service.ChatService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO chatMessage,
            Principal principal) {
        
        chatService.sendMessage(
                roomId,
                principal.getName(),
                chatMessage.getSenderName(),
                chatMessage.getContent()
        );
    }

    @MessageMapping("/chat.typing/{roomId}")
    public void sendTypingIndicator(
            @DestinationVariable String roomId,
            @Payload TypingIndicatorDTO typingIndicator,
            Principal principal) {
        
        // Broadcast typing status to the room topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", typingIndicator);
    }

    @Data
    public static class ChatMessageDTO {
        private String content;
        private String senderName;
    }

    @Data
    @Builder
    public static class TypingIndicatorDTO {
        private String userId;
        private String userName;
        private boolean isTyping;
    }
}

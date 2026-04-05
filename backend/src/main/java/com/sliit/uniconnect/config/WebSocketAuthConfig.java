package com.sliit.uniconnect.config;

import com.sliit.uniconnect.security.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthConfig implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    public WebSocketAuthConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Try Authorization header first (Bearer token), then native "token" header
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else {
                token = accessor.getFirstNativeHeader("token");
            }

            if (token != null && jwtUtil.isTokenValid(token)) {
                // Extract the MongoDB _id — this must match recipientUserId in Notification documents
                final String userId = jwtUtil.extractUserId(token);
                // Set principal so convertAndSendToUser can route to this user
                accessor.setUser(() -> userId);
            }
        }

        return message;
    }
}

package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.NotificationResponseDTO;
import com.sliit.uniconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Resolves the authenticated user's MongoDB _id.
     * JwtAuthFilter sets the principal name to the MongoDB _id directly,
     * so no findByStudentId lookup is needed.
     */
    private String resolveUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // GET /api/notifications?page=0&size=15
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        String userId = resolveUserId();
        return ResponseEntity.ok(notificationService.getNotifications(userId, page, size));
    }

    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userId = resolveUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        String userId = resolveUserId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    // PUT /api/notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        String userId = resolveUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}

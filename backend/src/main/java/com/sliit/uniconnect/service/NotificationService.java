package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.NotificationResponseDTO;
import com.sliit.uniconnect.model.Notification;
import com.sliit.uniconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Send & persist a notification ────────────────────────────────────────

    public void sendNotification(String recipientUserId,
                                  String type,
                                  String message,
                                  String link,
                                  String actorName,
                                  String actorImageUrl) {
        if (recipientUserId == null) return;

        Notification notification = Notification.builder()
                .recipientUserId(recipientUserId)
                .type(type)
                .message(message)
                .link(link)
                .actorName(actorName)
                .actorImageUrl(actorImageUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponseDTO dto = toDTO(saved);

        // Push to the user's private WebSocket queue
        // convertAndSendToUser routes using the principal name (= recipientUserId = MongoDB _id)
        try {
            messagingTemplate.convertAndSendToUser(recipientUserId, "/queue/notifications", dto);
        } catch (Exception e) {
            // User may not be connected — notification is already persisted, no action needed
            log.debug("WebSocket push skipped for user {}: {}", recipientUserId, e.getMessage());
        }
    }

    // ── Fetch paginated notifications ────────────────────────────────────────

    public Page<NotificationResponseDTO> getNotifications(String userId, int page, int size) {
        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    // ── Unread count ─────────────────────────────────────────────────────────

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }

    // ── Mark single notification as read ─────────────────────────────────────

    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipientUserId().equals(userId) && !n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    // ── Mark all notifications as read ───────────────────────────────────────

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndIsReadFalse(userId);
        if (!unread.isEmpty()) {
            unread.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unread);
        }
    }

    // ── DTO mapper ────────────────────────────────────────────────────────────

    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .link(n.getLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .actorName(n.getActorName())
                .actorImageUrl(n.getActorImageUrl())
                .build();
    }
}

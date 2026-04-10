package com.sliit.uniconnect.service;

import com.sliit.uniconnect.dto.EventDTO;
import com.sliit.uniconnect.exception.ClubNotFoundException;
import com.sliit.uniconnect.exception.UnauthorizedClubActionException;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.ClubPostRepository;
import com.sliit.uniconnect.repository.ClubRepository;
import com.sliit.uniconnect.repository.EventRepository;
import com.sliit.uniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ChatService chatService;
    private final ClubPostRepository clubPostRepository;

    // ── 1. Create Event (DRAFT) ──────────────────────────────────────────────

    public Event createEvent(EventDTO dto, String userId) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .venue(dto.getVenue())
                .capacity(dto.getCapacity())
                .clubId(dto.getClubId())
                .createdBy(userId)
                .status(EventStatus.DRAFT)
                .registeredCount(0)
                .registeredUserIds(new ArrayList<>())
                .approvals(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return eventRepository.save(event);
    }

    // ── 2. Submit for Approval ───────────────────────────────────────────────

    public Event submitForApproval(String eventId, String userId) {
        Event event = findEventOrThrow(eventId);

        if (!event.getCreatedBy().equals(userId)) {
            throw new UnauthorizedClubActionException("Only the event creator can submit for approval");
        }

        event.setStatus(EventStatus.PENDING_DEPT);
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    // ── 3. Approve by Department ─────────────────────────────────────────────

    public Event approveByDepartment(String eventId, String approverId, String comments) {
        Event event = findEventOrThrow(eventId);

        EventApproval approval = EventApproval.builder()
                .approverId(approverId)
                .approverRole("DEPT_LEADER")
                .status(ApprovalStatus.APPROVED)
                .comments(comments)
                .approvedAt(LocalDateTime.now())
                .build();

        if (event.getApprovals() == null) {
            event.setApprovals(new ArrayList<>());
        }
        event.getApprovals().add(approval);
        event.setStatus(EventStatus.PENDING_FACULTY);
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    // ── 4. Approve by Faculty ────────────────────────────────────────────────

    public Event approveByFaculty(String eventId, String approverId, String comments) {
        Event event = findEventOrThrow(eventId);

        EventApproval approval = EventApproval.builder()
                .approverId(approverId)
                .approverRole("FACULTY_MANAGER")
                .status(ApprovalStatus.APPROVED)
                .comments(comments)
                .approvedAt(LocalDateTime.now())
                .build();

        if (event.getApprovals() == null) {
            event.setApprovals(new ArrayList<>());
        }
        event.getApprovals().add(approval);
        event.setStatus(EventStatus.PUBLISHED);
        event.setUpdatedAt(LocalDateTime.now());
        
        // Notify creator
        notificationService.sendNotification(
            event.getCreatedBy(),
            "EVENT_PUBLISHED",
            "Your event '" + event.getTitle() + "' has been published!",
            "/events/" + event.getId(),
            "System",
            null
        );

        // ── Integration: Post to Club ChatRoom ──
        clubRepository.findById(event.getClubId()).ifPresent(club -> {
            chatService.createOrGetChatRoom(club.getId(), club.getName() + " Official", club.getAdminId(), RoomType.CLUB);
            // Use the new service method instead of direct repository access
            chatService.findRoomByTypeAndReferenceId(RoomType.CLUB, club.getId()).ifPresent(room -> {
                chatService.sendMessage(
                    room.getId(),
                    "SYSTEM",
                    "SLIIT UNI-Connect",
                    "🚨 New Event Published: " + event.getTitle() + "! Check it out here: /events/" + event.getId()
                );
            });

            // ── Integration: Create Club Post for Feed ──
            ClubPost announcement = ClubPost.builder()
                .clubId(club.getId())
                .authorId(event.getCreatedBy())
                .authorName(club.getName())
                .authorAvatarUrl(club.getProfilePicUrl())
                .content("📢 NEW EVENT: " + event.getTitle() + "\n\n" + event.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .likeCount(0)
                .likedByIds(new ArrayList<>())
                .build();
            clubPostRepository.save(announcement);
        });

        return eventRepository.save(event);
    }

    // ── 5. Register for Event ────────────────────────────────────────────────

    public Event registerForEvent(String eventId, String userId, String userName) {
        Event event = findEventOrThrow(eventId);

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot register for an unpublished event");
        }

        if (event.getStartDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot register for past events");
        }

        if (event.getRegisteredCount() >= event.getCapacity()) {
            throw new IllegalStateException("Event has reached maximum capacity");
        }

        if (event.getRegisteredUserIds().contains(userId)) {
            throw new IllegalStateException("Already registered for this event");
        }

        if (event.getRegisteredUserIds() == null) {
            event.setRegisteredUserIds(new ArrayList<>());
        }
        event.getRegisteredUserIds().add(userId);
        event.setRegisteredCount(event.getRegisteredUserIds().size());
        event.setUpdatedAt(LocalDateTime.now());
        
        // Notify user
        notificationService.sendNotification(
            userId,
            "EVENT_REGISTRATION",
            "You have successfully registered for '" + event.getTitle() + "'",
            "/events/" + event.getId(),
            "System",
            null
        );

        return eventRepository.save(event);
    }

    // ── 6. Unregister from Event ─────────────────────────────────────────────

    public Event unregisterFromEvent(String eventId, String userId) {
        Event event = findEventOrThrow(eventId);

        if (event.getRegisteredUserIds().remove(userId)) {
            event.setRegisteredCount(event.getRegisteredUserIds().size());
            event.setUpdatedAt(LocalDateTime.now());
            return eventRepository.save(event);
        }
        
        return event;
    }

    // ── 7. Get Calendar Events ───────────────────────────────────────────────

    public List<Event> getCalendarEvents(Integer year, Integer month, String facultyId, String departmentId, String clubId, String currentUserId) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);

        List<Event> events = eventRepository.findPublishedEventsBetween(start, end);

        List<Event> eventsList = events.stream()
                .filter(e -> clubId == null || e.getClubId().equals(clubId))
                .filter(e -> {
                    if (facultyId == null) return true;
                    return clubRepository.findById(e.getClubId())
                            .map(c -> facultyId.equals(c.getFaculty() != null ? c.getFaculty().name() : null))
                            .orElse(false);
                })
                .filter(e -> {
                    if (departmentId == null) return true;
                    return userRepository.findById(e.getCreatedBy())
                            .map(u -> departmentId.equals(u.getDepartment()))
                            .orElse(false);
                })
                .collect(Collectors.toList());

        if (currentUserId != null) {
            List<Event> myDrafts = eventRepository.findByCreatedBy(currentUserId).stream()
                    .filter(e -> e.getStatus() != EventStatus.PUBLISHED)
                    .filter(e -> !e.getStartDate().isBefore(start) && !e.getStartDate().isAfter(end))
                    .collect(Collectors.toList());
            eventsList.addAll(myDrafts);
        }

        return eventsList;
    }

    // ── 8. Get My Registered Events ──────────────────────────────────────────

    public List<Event> getMyRegisteredEvents(String userId) {
        return eventRepository.findByRegisteredUserIdsContains(userId);
    }

    // ── 9. Get Events Created by Me ──────────────────────────────────────────

    public List<Event> getMyCreatedEvents(String userId) {
        return eventRepository.findByCreatedBy(userId);
    }

    // ── 9. Get Event by ID ───────────────────────────────────────────────────

    public Event getEventById(String eventId) {
        return findEventOrThrow(eventId);
    }

    // ── 10. Get Pending Approvals ────────────────────────────────────────────

    public List<Event> getPendingDeptApprovals() {
        return eventRepository.findPendingDeptApprovals();
    }

    public List<Event> getPendingFacultyApprovals() {
        return eventRepository.findPendingFacultyApprovals();
    }

    // ── 11. Get Upcoming Events ──────────────────────────────────────────────

    public List<Event> getUpcomingEvents(int limit) {
        return eventRepository.findUpcomingEvents(
            LocalDateTime.now(), 
            PageRequest.of(0, limit, Sort.by(Sort.Direction.ASC, "startDate"))
        );
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Event findEventOrThrow(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
    }
}

package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.ApprovalRequestDTO;
import com.sliit.uniconnect.dto.EventDTO;
import com.sliit.uniconnect.model.Event;
import com.sliit.uniconnect.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(dto, currentUserId()));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> submitForApproval(@PathVariable String id) {
        return ResponseEntity.ok(eventService.submitForApproval(id, currentUserId()));
    }

    @PutMapping("/{id}/approve/department")
    @PreAuthorize("hasRole('DEPT_LEADER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Event> approveByDepartment(
            @PathVariable String id, @RequestBody ApprovalRequestDTO dto) {
        return ResponseEntity.ok(eventService.approveByDepartment(id, currentUserId(), dto.getComments()));
    }

    @PutMapping("/{id}/approve/faculty")
    @PreAuthorize("hasRole('FACULTY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Event> approveByFaculty(
            @PathVariable String id, @RequestBody ApprovalRequestDTO dto) {
        return ResponseEntity.ok(eventService.approveByFaculty(id, currentUserId(), dto.getComments()));
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> register(@PathVariable String id) {
        return ResponseEntity.ok(eventService.registerForEvent(id, currentUserId(), "User"));
    }

    @DeleteMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> unregister(@PathVariable String id) {
        return ResponseEntity.ok(eventService.unregisterFromEvent(id, currentUserId()));
    }

    @GetMapping("/calendar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getCalendarEvents(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) String facultyId,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String clubId) {
        return ResponseEntity.ok(eventService.getCalendarEvents(year, month, facultyId, departmentId, clubId, currentUserId()));
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getMyRegisteredEvents() {
        return ResponseEntity.ok(eventService.getMyRegisteredEvents(currentUserId()));
    }

    @GetMapping("/managed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getMyCreatedEvents() {
        return ResponseEntity.ok(eventService.getMyCreatedEvents(currentUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/pending/department")
    @PreAuthorize("hasRole('DEPT_LEADER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<Event>> getPendingDeptApprovals() {
        return ResponseEntity.ok(eventService.getPendingDeptApprovals());
    }

    @GetMapping("/pending/faculty")
    @PreAuthorize("hasRole('FACULTY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<Event>> getPendingFacultyApprovals() {
        return ResponseEntity.ok(eventService.getPendingFacultyApprovals());
    }

    @GetMapping("/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getUpcomingEvents(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(eventService.getUpcomingEvents(limit));
    }
}

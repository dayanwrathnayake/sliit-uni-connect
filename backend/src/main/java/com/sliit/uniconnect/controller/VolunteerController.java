package com.sliit.uniconnect.controller;

import com.sliit.uniconnect.dto.AwardPointsRequestDTO;
import com.sliit.uniconnect.dto.VolunteerApplicationRequestDTO;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.service.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    // ── Applications ─────────────────────────────────────────────────────────

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VolunteerApplication> apply(@Valid @RequestBody VolunteerApplicationRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                volunteerService.applyToVolunteer(
                        currentUserId(),
                        dto.getEventId(),
                        dto.getCategory(),
                        dto.getHoursType(),
                        dto.getDescription(),
                        dto.getYear(),
                        dto.getSemester()
                )
        );
    }

    @GetMapping("/event/{eventId}/applications")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<VolunteerApplication>> getApplications(@PathVariable String eventId) {
        return ResponseEntity.ok(volunteerService.getApplicationsByEvent(eventId));
    }

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<VolunteerApplication> updateApplicationStatus(
            @PathVariable String id, @RequestParam VolunteerStatus status) {
        return ResponseEntity.ok(volunteerService.updateApplicationStatus(id, status));
    }

    @GetMapping("/my/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<VolunteerApplication>> getMyApplications() {
        return ResponseEntity.ok(volunteerService.getMyApplications(currentUserId()));
    }

    // ── Tasks ────────────────────────────────────────────────────────────────

    @PostMapping("/applications/{id}/tasks")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<VolunteerTask> assignTask(
            @PathVariable String id, @RequestBody String description) {
        return ResponseEntity.ok(volunteerService.assignTask(id, currentUserId(), description));
    }

    @PutMapping("/tasks/{id}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VolunteerTask> completeTask(@PathVariable String id) {
        return ResponseEntity.ok(volunteerService.completeTask(id));
    }

    @GetMapping("/my/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VolunteerTask>> getMyTasks() {
        return ResponseEntity.ok(volunteerService.getMyTasks(currentUserId()));
    }

    /** Club Admin: all tasks for a given event (to review and award points) */
    @GetMapping("/event/{eventId}/tasks")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<VolunteerTask>> getEventTasks(@PathVariable String eventId) {
        return ResponseEntity.ok(volunteerService.getTasksByEvent(eventId));
    }

    // ── Points ───────────────────────────────────────────────────────────────

    @PostMapping("/tasks/{id}/award-points")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<VolunteerPoint> awardPoints(
            @PathVariable String id, @Valid @RequestBody AwardPointsRequestDTO dto) {
        return ResponseEntity.ok(volunteerService.awardPoints(id, dto.getPoints(), dto.getRating()));
    }

    @GetMapping("/my/points")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VolunteerPoint>> getMyPoints() {
        return ResponseEntity.ok(volunteerService.getMyPoints(currentUserId()));
    }

    @GetMapping("/my/points/total")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> getMyTotalPoints() {
        return ResponseEntity.ok(volunteerService.getMyTotalPoints(currentUserId()));
    }
    
    @GetMapping("/events/{eventId}/leaderboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VolunteerPoint>> getLeaderboard(@PathVariable String eventId) {
        return ResponseEntity.ok(volunteerService.getEventLeaderboard(eventId));
    }

    // ── Certificates ─────────────────────────────────────────────────────────

    @PostMapping("/events/{eventId}/request-certificate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CertificateRequest> requestCertificate(@PathVariable String eventId) {
        return ResponseEntity.ok(volunteerService.requestCertificate(currentUserId(), eventId));
    }

    @PutMapping("/certificates/{id}/approve")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<CertificateRequest> approveCertificate(@PathVariable String id) {
        return ResponseEntity.ok(volunteerService.approveCertificate(id));
    }

    /** Club Admin: all certificate requests for a given event */
    @GetMapping("/event/{eventId}/certificate-requests")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<CertificateRequest>> getEventCertificateRequests(@PathVariable String eventId) {
        return ResponseEntity.ok(volunteerService.getCertificateRequestsByEvent(eventId));
    }

    /** Stream the approved certificate as a PDF download */
    @GetMapping("/certificates/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String id) {
        byte[] pdf = volunteerService.generateCertificatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "volunteer-certificate-" + id + ".pdf");
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/my/certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CertificateRequest>> getMyCertificates() {
        return ResponseEntity.ok(volunteerService.getMyCertificates(currentUserId()));
    }
}

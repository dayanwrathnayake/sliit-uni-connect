package com.sliit.uniconnect.service;

import com.sliit.uniconnect.exception.BusinessException;
import com.sliit.uniconnect.exception.UserNotFoundException;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerService {

    private final VolunteerApplicationRepository applicationRepository;
    private final VolunteerTaskRepository taskRepository;
    private final VolunteerPointRepository pointRepository;
    private final CertificateRequestRepository certificateRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    // ── Volunteer Applications ───────────────────────────────────────────────

    public VolunteerApplication applyToVolunteer(String userId, String eventId, VolunteerCategory category, HoursType hoursType, String description, String year, String semester) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException("Event not found"));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("Cannot volunteer for unpublished events");
        }

        // 1. Faculty Restriction Check
        if (event.getFacultyScope() == FacultyScope.SPECIFIC_FACULTY) {
            if (user.getFaculty() == null || !user.getFaculty().equals(event.getFaculty())) {
                throw new BusinessException("You can only volunteer for events in your own faculty.");
            }
        }

        // 2. Duplicate Application Check
        if (applicationRepository.findByUserIdAndEventId(userId, eventId).isPresent()) {
            throw new BusinessException("You have already applied to volunteer for this event.");
        }

        VolunteerApplication application = VolunteerApplication.builder()
                .userId(userId)
                .eventId(eventId)
                .registrationNumber(user.getStudentId())
                .year(year)
                .semester(semester)
                .category(category)
                .hoursType(hoursType)
                .description(description)
                .status(VolunteerStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .faculty(user.getFaculty())
                .build();

        return applicationRepository.save(application);
    }

    public List<VolunteerApplication> getApplicationsByEvent(String eventId) {
        return applicationRepository.findByEventId(eventId);
    }

    public VolunteerApplication updateApplicationStatus(String applicationId, VolunteerStatus status) {
        VolunteerApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    public List<VolunteerApplication> getMyApplications(String userId) {
        return applicationRepository.findByUserId(userId);
    }

    // ── Volunteer Tasks ──────────────────────────────────────────────────────

    public VolunteerTask assignTask(String applicationId, String userId, String taskDescription) {
        VolunteerApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found"));
        
        if (application.getStatus() != VolunteerStatus.APPROVED) {
            throw new BusinessException("Volunteer must be approved before assigning tasks");
        }

        VolunteerTask task = VolunteerTask.builder()
                .volunteerApplicationId(applicationId)
                .eventId(application.getEventId())
                .assignedBy(userId)
                .assignedTo(application.getUserId())
                .taskDescription(taskDescription)
                .status(TaskStatus.PENDING)
                .build();

        return taskRepository.save(task);
    }

    public VolunteerTask completeTask(String taskId) {
        VolunteerTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task not found"));
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public List<VolunteerTask> getMyTasks(String userId) {
        return taskRepository.findByAssignedTo(userId);
    }

    // ── Point Awarding ───────────────────────────────────────────────────────

    @Transactional
    public VolunteerPoint awardPoints(String taskId, int points, PointRating rating) {
        VolunteerTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task not found"));
        
        if (task.getStatus() != TaskStatus.COMPLETED) {
            throw new BusinessException("Task must be completed before awarding points");
        }

        VolunteerPoint point = VolunteerPoint.builder()
                .volunteerApplicationId(task.getVolunteerApplicationId())
                .taskId(taskId)
                .userId(task.getAssignedTo())
                .eventId(task.getEventId())
                .points(points)
                .rating(rating)
                .awardedAt(LocalDateTime.now())
                .build();

        pointRepository.save(point);

        // Update User Model (Points Integration)
        User user = userRepository.findById(task.getAssignedTo())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

        return point;
    }

    public List<VolunteerPoint> getMyPoints(String userId) {
        return pointRepository.findByUserId(userId);
    }

    public int getMyTotalPoints(String userId) {
        return pointRepository.findByUserId(userId).stream()
                .mapToInt(VolunteerPoint::getPoints)
                .sum();
    }

    // ── Certificates ─────────────────────────────────────────────────────────

    public CertificateRequest requestCertificate(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException("Event not found"));

        if (event.getStatus() != EventStatus.CLOSED) {
            throw new BusinessException("Certificates can only be requested after the event is closed");
        }

        if (certificateRepository.findByUserIdAndEventId(userId, eventId).isPresent()) {
            throw new BusinessException("Certificate request already exists for this event");
        }

        CertificateRequest request = CertificateRequest.builder()
                .userId(userId)
                .eventId(eventId)
                .status(CertificateStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        return certificateRepository.save(request);
    }

    public CertificateRequest approveCertificate(String requestId) {
        CertificateRequest request = certificateRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Certificate request not found"));
        
        request.setStatus(CertificateStatus.GENERATED);
        request.setPdfUrl("https://sliit-uni-connect.com/certificates/dummy-" + request.getId() + ".pdf"); // Placeholder URL
        return certificateRepository.save(request);
    }

    public List<CertificateRequest> getMyCertificates(String userId) {
        return certificateRepository.findByUserId(userId);
    }

    public List<VolunteerPoint> getEventLeaderboard(String eventId) {
        return pointRepository.findByEventId(eventId).stream()
                .sorted((a, b) -> Integer.compare(b.getPoints(), a.getPoints()))
                .limit(10)
                .toList();
    }
}

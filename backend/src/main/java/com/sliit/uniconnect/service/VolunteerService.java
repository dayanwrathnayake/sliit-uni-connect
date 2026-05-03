package com.sliit.uniconnect.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import com.sliit.uniconnect.exception.BusinessException;
import com.sliit.uniconnect.exception.UserNotFoundException;
import com.sliit.uniconnect.model.*;
import com.sliit.uniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VolunteerService {

    private final VolunteerApplicationRepository applicationRepository;
    private final VolunteerTaskRepository taskRepository;
    private final VolunteerPointRepository pointRepository;
    private final CertificateRequestRepository certificateRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;



    private String resolveUserName(User u) {
        if (u.getDisplayName() != null && !u.getDisplayName().isBlank()) {
            return u.getDisplayName();
        }
        if (u.getStudentId() != null && !u.getStudentId().isBlank()) {
            return u.getStudentId();
        }
        return u.getEmail();
    }

    // ── Volunteer Applications ───────────────────────────────────────────────

    public VolunteerApplication applyToVolunteer(String userId, String eventId, VolunteerCategory category,
            HoursType hoursType, String description, String year, String semester) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException("Event not found"));

        if (event.getStatus() != null && event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("Cannot volunteer for unpublished events");
        }

        // 1. Faculty Restriction Check (only if event scopes to a specific faculty)
        if (FacultyScope.SPECIFIC_FACULTY.equals(event.getFacultyScope())) {
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
        List<VolunteerApplication> apps = applicationRepository.findByEventId(eventId);
        apps.forEach(app -> {
            userRepository.findById(app.getUserId()).ifPresent(u -> {
                app.setUserName(resolveUserName(u));
                app.setUserStudentId(u.getStudentId());
            });
        });
        return apps;
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

    public List<VolunteerTask> getTasksByEvent(String eventId) {
        List<VolunteerTask> tasks = taskRepository.findByEventId(eventId);
        tasks.forEach(task -> {
            userRepository.findById(task.getAssignedTo()).ifPresent(u -> {
                task.setUserName(resolveUserName(u));
                task.setUserStudentId(u.getStudentId());
            });
        });
        return tasks;
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

        // Accumulate points on the User record
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
        // PDF is streamed on-demand from GET /api/volunteers/certificates/{id}/download
        return certificateRepository.save(request);
    }

    public List<CertificateRequest> getMyCertificates(String userId) {
        return certificateRepository.findByUserId(userId);
    }

    public List<CertificateRequest> getCertificateRequestsByEvent(String eventId) {
        List<CertificateRequest> reqs = certificateRepository.findByEventId(eventId);
        reqs.forEach(req -> {
            userRepository.findById(req.getUserId()).ifPresent(u -> {
                req.setUserName(resolveUserName(u));
                req.setUserStudentId(u.getStudentId());
            });
        });
        return reqs;
    }

    public List<VolunteerPoint> getEventLeaderboard(String eventId) {
        // Group points by userId and sum them up
        Map<String, Integer> userPoints = pointRepository.findByEventId(eventId).stream()
                .collect(Collectors.groupingBy(
                        VolunteerPoint::getUserId,
                        Collectors.summingInt(VolunteerPoint::getPoints)
                ));

        // Create an aggregated VolunteerPoint list, sort and limit
        List<VolunteerPoint> aggregatedPoints = userPoints.entrySet().stream()
                .map(entry -> VolunteerPoint.builder()
                        .userId(entry.getKey())
                        .eventId(eventId)
                        .points(entry.getValue())
                        .build())
                .sorted((a, b) -> Integer.compare(b.getPoints(), a.getPoints()))
                .limit(10)
                .toList();
        
        aggregatedPoints.forEach(point -> {
            userRepository.findById(point.getUserId()).ifPresent(u -> {
                point.setUserName(resolveUserName(u));
                point.setUserStudentId(u.getStudentId());
            });
        });
        return aggregatedPoints;
    }

    // ── PDF Certificate Generation ────────────────────────────────────────────

    /**
     * Generates a premium volunteer certificate PDF on-the-fly.
     * Only works once the club admin has approved (status = GENERATED).
     */
    public byte[] generateCertificatePdf(String requestId) {
        CertificateRequest request = certificateRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Certificate request not found"));

        if (request.getStatus() != CertificateStatus.GENERATED) {
            throw new BusinessException("Certificate has not been approved yet");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new BusinessException("Event not found"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate());
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            String name = (user.getDisplayName() != null && !user.getDisplayName().isBlank())
                ? user.getDisplayName()
                : (user.getStudentId() != null ? user.getStudentId() : user.getEmail());

            // ── Dark background ──────────────────────────────────────────
            PdfContentByte canvas = writer.getDirectContentUnder();
            canvas.setColorFill(new Color(15, 23, 42));
            canvas.rectangle(0, 0, doc.getPageSize().getWidth(), doc.getPageSize().getHeight());
            canvas.fill();
            // Top header band
            canvas.setColorFill(new Color(30, 58, 138));
            canvas.rectangle(0, doc.getPageSize().getHeight() - 75, doc.getPageSize().getWidth(), 75);
            canvas.fill();
            // Bottom footer band
            canvas.setColorFill(new Color(30, 58, 138));
            canvas.rectangle(0, 0, doc.getPageSize().getWidth(), 45);
            canvas.fill();

            // ── Double border ────────────────────────────────────────────
            PdfContentByte cb = writer.getDirectContent();
            cb.setColorStroke(new Color(99, 102, 241));
            cb.setLineWidth(3f);
            cb.rectangle(18, 18, doc.getPageSize().getWidth() - 36, doc.getPageSize().getHeight() - 36);
            cb.stroke();
            cb.setColorStroke(new Color(99, 102, 241));
            cb.setLineWidth(0.8f);
            cb.rectangle(26, 26, doc.getPageSize().getWidth() - 52, doc.getPageSize().getHeight() - 52);
            cb.stroke();

            // ── Fonts ────────────────────────────────────────────────────
            Font titleFont  = new Font(Font.HELVETICA, 34, Font.BOLD,   new Color(255, 255, 255));
            Font subFont    = new Font(Font.HELVETICA, 13, Font.NORMAL, new Color(148, 163, 184));
            Font nameFont   = new Font(Font.HELVETICA, 30, Font.BOLD,   new Color(129, 140, 248));
            Font bodyFont   = new Font(Font.HELVETICA, 13, Font.NORMAL, new Color(203, 213, 225));
            Font eventFont  = new Font(Font.HELVETICA, 17, Font.BOLD,   new Color(251, 191, 36));
            Font smallFont  = new Font(Font.HELVETICA,  9, Font.NORMAL, new Color(100, 116, 139));

            // ── Header ───────────────────────────────────────────────────
            doc.add(new Paragraph("\n"));
            Paragraph org = new Paragraph("SLIIT UNI CONNECT", subFont);
            org.setAlignment(Element.ALIGN_CENTER);
            doc.add(org);

            Paragraph certTitle = new Paragraph("Certificate of Volunteer Service", titleFont);
            certTitle.setAlignment(Element.ALIGN_CENTER);
            certTitle.setSpacingBefore(6);
            doc.add(certTitle);

            Paragraph rule = new Paragraph("────────────────────────────────────────────────────────────────", subFont);
            rule.setAlignment(Element.ALIGN_CENTER);
            rule.setSpacingBefore(4);
            doc.add(rule);

            // ── Body ─────────────────────────────────────────────────────
            Paragraph presented = new Paragraph("\nThis certificate is proudly presented to", bodyFont);
            presented.setAlignment(Element.ALIGN_CENTER);
            presented.setSpacingBefore(18);
            doc.add(presented);

            Paragraph recipientName = new Paragraph(name, nameFont);
            recipientName.setAlignment(Element.ALIGN_CENTER);
            recipientName.setSpacingBefore(10);
            doc.add(recipientName);

            if (user.getStudentId() != null) {
                Paragraph regNo = new Paragraph("Registration No: " + user.getStudentId(), subFont);
                regNo.setAlignment(Element.ALIGN_CENTER);
                doc.add(regNo);
            }

            Paragraph forService = new Paragraph("\nin recognition of outstanding volunteer service rendered at", bodyFont);
            forService.setAlignment(Element.ALIGN_CENTER);
            forService.setSpacingBefore(14);
            doc.add(forService);

            Paragraph evtTitle = new Paragraph(event.getTitle(), eventFont);
            evtTitle.setAlignment(Element.ALIGN_CENTER);
            evtTitle.setSpacingBefore(8);
            doc.add(evtTitle);

            // ── Date & Footer ─────────────────────────────────────────────
            String issued = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            Paragraph issuedP = new Paragraph("\nDate Issued: " + issued, bodyFont);
            issuedP.setAlignment(Element.ALIGN_CENTER);
            issuedP.setSpacingBefore(22);
            doc.add(issuedP);

            doc.add(new Paragraph("\n\n"));
            Paragraph footerLine = new Paragraph(
                    "Digitally issued by SLIIT UNI Connect  |  Certificate ID: " + requestId, smallFont);
            footerLine.setAlignment(Element.ALIGN_CENTER);
            doc.add(footerLine);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BusinessException("Failed to generate certificate PDF: " + e.getMessage());
        }
    }
}

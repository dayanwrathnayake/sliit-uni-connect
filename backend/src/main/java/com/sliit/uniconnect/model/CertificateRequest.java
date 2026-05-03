package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "certificate_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateRequest {

    @Id
    private String id;
    private String userId;
    private String eventId;
    private CertificateStatus status;
    private LocalDateTime requestedAt;
    private String pdfUrl; // placeholder until generated

    @org.springframework.data.annotation.Transient
    private String userName;

    @org.springframework.data.annotation.Transient
    private String userStudentId;
}

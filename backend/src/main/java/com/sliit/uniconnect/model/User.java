package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String studentId;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String displayName;

    @Builder.Default
    private Role role = Role.STUDENT;

    private FacultyEnum faculty;

    private String department;

    @Indexed(unique = true)
    private String referralCode;

    private String referredBy;

    @Builder.Default
    private int points = 0;

    @Builder.Default
    private boolean isEmailVerified = false;

    private String emailVerificationToken;

    private String profilePicUrl;

    private String bio;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    private String id;
    private String studentId;
    private String displayName;
    private String email;
    private String role;
    private String faculty;
    private String department;
    private String referralCode;
    private int points;
    private String profilePicUrl;
    private String bio;
    private boolean isEmailVerified;
    private LocalDateTime createdAt;
}

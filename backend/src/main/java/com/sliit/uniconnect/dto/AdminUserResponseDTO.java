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
public class AdminUserResponseDTO {

    private String id;
    private String studentId;
    private String displayName;
    private String email;
    private String faculty;
    private String department;
    private String role;
    private boolean isActive;
    private boolean isEmailVerified;
    private String profilePicUrl;
    private String referralCode;
    private int points;
    private LocalDateTime createdAt;
    private int followedClubsCount;
}

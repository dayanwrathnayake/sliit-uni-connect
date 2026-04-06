package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {

    private long totalStudents;
    private long activeStudents;
    private long inactiveStudents;
    private long verifiedStudents;
    private long unverifiedStudents;
    private long clubAdmins;
    private Map<String, Long> byFaculty;
}

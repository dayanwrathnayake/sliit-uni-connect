package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventApproval {
    private String approverId;
    private String approverRole; // DEPT_LEADER, FACULTY_MANAGER
    private ApprovalStatus status;
    private String comments;
    private LocalDateTime approvedAt;
}

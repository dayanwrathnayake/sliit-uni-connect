package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.FacultyEnum;
import com.sliit.uniconnect.model.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffUserResponseDTO {

    private String id;
    private String staffId;
    private String displayName;
    private String email;
    private StaffRole role;
    private FacultyEnum faculty;
    private boolean isActive;
    private LocalDateTime createdAt;
}

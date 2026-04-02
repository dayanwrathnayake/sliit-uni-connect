package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAuthResponseDTO {

    private String accessToken;

    /** Staff sessions do NOT use a refresh token — 8-hour access token only. */
    private String staffId;
    private String displayName;
    private StaffRole role;

    /** Null for SYSTEM_ADMIN. Populated for FACULTY_MANAGER. */
    private String faculty;
}

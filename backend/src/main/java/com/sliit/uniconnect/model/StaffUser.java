package com.sliit.uniconnect.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "staff_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffUser {

    @Id
    private String id;

    /** Auto-generated unique staff identifier, e.g. FAC-CS-001, SYS-ADM-01 */
    @Indexed(unique = true)
    private String staffId;

    /** Must be @sliit.lk domain */
    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String displayName;

    /** SYSTEM_ADMIN or FACULTY_MANAGER */
    private StaffRole role;

    /**
     * Which faculty this staff member manages.
     * NULL for SYSTEM_ADMIN (manages the whole platform).
     * REQUIRED for FACULTY_MANAGER.
     */
    private FacultyEnum faculty;

    /** Soft-delete flag — deactivated staff cannot log in but records are kept. */
    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

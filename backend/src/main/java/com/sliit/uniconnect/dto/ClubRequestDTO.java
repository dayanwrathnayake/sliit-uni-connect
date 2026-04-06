package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.ClubCategory;
import com.sliit.uniconnect.model.FacultyEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubRequestDTO {

    @NotBlank(message = "Club name is required")
    private String name;

    @NotBlank(message = "Club description is required")
    private String description;

    @NotNull(message = "Club category is required")
    private ClubCategory category;

    /** Only required when category is FACULTY_MEDIA. */
    private FacultyEnum faculty;

    private String profilePicUrl;

    private String bannerUrl;
}

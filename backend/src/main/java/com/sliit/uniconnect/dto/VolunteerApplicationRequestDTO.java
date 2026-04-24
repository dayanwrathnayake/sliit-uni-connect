package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.HoursType;
import com.sliit.uniconnect.model.VolunteerCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolunteerApplicationRequestDTO {
    @NotBlank(message = "Event ID is required")
    private String eventId;

    @NotNull(message = "Category is required")
    private VolunteerCategory category;

    @NotNull(message = "Hours type is required")
    private HoursType hoursType;

    private String description;

    @NotBlank(message = "Year is required")
    private String year;

    @NotBlank(message = "Semester is required")
    private String semester;
}

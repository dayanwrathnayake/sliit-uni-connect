package com.sliit.uniconnect.dto;

import com.sliit.uniconnect.model.PointRating;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AwardPointsRequestDTO {
    @Min(value = 1, message = "Points must be at least 1")
    private int points;

    private PointRating rating;
}

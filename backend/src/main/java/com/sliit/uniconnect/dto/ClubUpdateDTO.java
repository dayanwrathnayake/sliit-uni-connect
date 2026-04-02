package com.sliit.uniconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubUpdateDTO {

    /** Null means "keep existing value" — partial update pattern. */
    private String description;
    private String profilePicUrl;
    private String bannerUrl;
}

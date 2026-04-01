package com.sliit.uniconnect.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {

    /** If null, the field is not updated (partial-update pattern). */
    private String displayName;

    @Size(max = 300, message = "Bio must not exceed 300 characters")
    private String bio;

    private String department;

    /** Cloudinary secure_url — set by frontend after a successful upload. */
    private String profilePicUrl;
}

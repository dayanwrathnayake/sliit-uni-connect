package com.sliit.uniconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostDTO {

    @NotBlank(message = "Post content cannot be empty")
    @Size(max = 1000, message = "Post content must not exceed 1000 characters")
    private String content;

    private String imageUrl;
}

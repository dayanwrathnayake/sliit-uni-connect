package com.sliit.uniconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank(message = "Student ID is required")
    @Pattern(regexp = "^(IT|EN|BM|HS)\\d{8}$", message = "Invalid student ID format (e.g. IT23413474)")
    private String studentId;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[a-z0-9]+@my\\.sliit\\.lk$", message = "Email must be a valid @my.sliit.lk address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 60, message = "Display name must be 2–60 characters")
    private String displayName;

    // optional – referral code of the person who referred this student
    private String referralCode;
}

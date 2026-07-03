package com.society.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String phoneNumber;
    private String flatNumber;
}

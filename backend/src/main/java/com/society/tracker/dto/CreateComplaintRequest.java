package com.society.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateComplaintRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;
}

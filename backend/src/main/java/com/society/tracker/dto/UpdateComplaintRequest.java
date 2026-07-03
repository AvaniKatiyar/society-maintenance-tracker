package com.society.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateComplaintRequest {
    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Update note is required")
    private String note;
}

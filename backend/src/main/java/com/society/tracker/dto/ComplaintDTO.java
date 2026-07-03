package com.society.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {
    private Long id;
    private Long residentId;
    private String residentName;
    private String residentFlat;
    private String residentEmail;
    private String category;
    private String description;
    private String imageUrl;
    private String priority;
    private String status;
    private boolean overdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

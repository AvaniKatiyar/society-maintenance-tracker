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
public class ComplaintHistoryDTO {
    private Long id;
    private Long complaintId;
    private String oldStatus;
    private String newStatus;
    private String note;
    private String actorName;
    private LocalDateTime createdAt;
}

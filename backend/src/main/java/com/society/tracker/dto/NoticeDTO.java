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
public class NoticeDTO {
    private Long id;
    private String title;
    private String description;
    private boolean important;
    private LocalDateTime expiryDate;
    private String createdBy;
    private LocalDateTime createdAt;
}

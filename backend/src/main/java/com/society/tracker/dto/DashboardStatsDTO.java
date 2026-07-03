package com.society.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalComplaints;
    private long openComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long overdueComplaints;
    
    private List<CategoryStatsDTO> complaintsByCategory;
    private List<StatusStatsDTO> complaintsByStatus;
    private List<PriorityStatsDTO> complaintsByPriority;
    
    private List<ComplaintDTO> latestComplaints;
}

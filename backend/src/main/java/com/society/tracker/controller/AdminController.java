package com.society.tracker.controller;

import com.society.tracker.dto.*;
import com.society.tracker.entity.User;
import com.society.tracker.service.ComplaintService;
import com.society.tracker.service.NoticeService;
import com.society.tracker.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final NoticeService noticeService;
    private final SettingsService settingsService;

    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintDTO>> getAdminComplaints(
            @RequestParam(value = "residentSearch", required = false) String residentSearch,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "overdue", required = false) Boolean overdue,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(complaintService.getAdminComplaints(residentSearch, status, priority, overdue, category, search, pageable));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintDTO> adminUpdateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody UpdateComplaintRequest request,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(complaintService.adminUpdateComplaint(id, request, admin));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getAdminDashboardStats() {
        return ResponseEntity.ok(complaintService.getAdminDashboardStats());
    }

    @PostMapping("/notices")
    public ResponseEntity<NoticeDTO> createNotice(
            @Valid @RequestBody CreateNoticeRequest request,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(noticeService.createNotice(request, admin));
    }

    @GetMapping("/notices")
    public ResponseEntity<List<NoticeDTO>> getAdminNotices(
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(noticeService.getAllNotices(search));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/settings")
    public ResponseEntity<SettingsDTO> updateSetting(
            @Valid @RequestBody SettingsDTO request
    ) {
        return ResponseEntity.ok(settingsService.updateSetting(request.getSettingKey(), request.getSettingValue()));
    }

    @GetMapping("/complaints/export")
    public ResponseEntity<Resource> exportComplaints(
            @RequestParam(value = "residentSearch", required = false) String residentSearch,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "overdue", required = false) Boolean overdue,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search
    ) {
        ByteArrayInputStream in = complaintService.exportComplaintsToExcel(residentSearch, status, priority, overdue, category, search);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=complaints.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}

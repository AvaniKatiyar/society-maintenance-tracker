package com.society.tracker.controller;

import com.society.tracker.dto.CreateComplaintRequest;
import com.society.tracker.dto.ComplaintDTO;
import com.society.tracker.dto.ComplaintHistoryDTO;
import com.society.tracker.entity.User;
import com.society.tracker.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ComplaintDTO> createComplaint(
            @AuthenticationPrincipal User resident,
            @RequestPart("data") @Valid CreateComplaintRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(complaintService.createComplaint(request, file, resident));
    }

    @GetMapping
    public ResponseEntity<Page<ComplaintDTO>> getResidentComplaints(
            @AuthenticationPrincipal User resident,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "overdue", required = false) Boolean overdue,
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(complaintService.getResidentComplaints(resident, status, priority, overdue, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDTO> getComplaintDetails(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(complaintService.getComplaintDetails(id, currentUser));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ComplaintHistoryDTO>> getComplaintHistory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(complaintService.getComplaintHistory(id, currentUser));
    }
}

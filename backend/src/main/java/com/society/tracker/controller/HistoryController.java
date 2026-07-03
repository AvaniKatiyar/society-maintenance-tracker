package com.society.tracker.controller;

import com.society.tracker.dto.ComplaintHistoryDTO;
import com.society.tracker.entity.User;
import com.society.tracker.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final ComplaintService complaintService;

    @GetMapping("/{id}")
    public ResponseEntity<List<ComplaintHistoryDTO>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(complaintService.getComplaintHistory(id, currentUser));
    }
}

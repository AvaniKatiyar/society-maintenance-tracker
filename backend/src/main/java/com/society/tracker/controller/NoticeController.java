package com.society.tracker.controller;

import com.society.tracker.dto.NoticeDTO;
import com.society.tracker.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getActiveNotices(
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(noticeService.getActiveNotices(search));
    }
}

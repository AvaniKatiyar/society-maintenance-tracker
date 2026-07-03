package com.society.tracker.controller;

import com.society.tracker.dto.SettingsDTO;
import com.society.tracker.entity.Settings;
import com.society.tracker.mapper.DtoMapper;
import com.society.tracker.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsDTO> getOverdueThreshold() {
        Settings setting = settingsService.getSetting("overdue_threshold_days");
        return ResponseEntity.ok(DtoMapper.toSettingsDTO(setting));
    }
}

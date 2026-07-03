package com.society.tracker.service;

import com.society.tracker.dto.SettingsDTO;
import com.society.tracker.entity.Settings;
import com.society.tracker.exception.BadRequestException;
import com.society.tracker.exception.ResourceNotFoundException;
import com.society.tracker.mapper.DtoMapper;
import com.society.tracker.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public Settings getSetting(String key) {
        return settingsRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found for key: " + key));
    }

    public SettingsDTO updateSetting(String key, String value) {
        if (key.equals("overdue_threshold_days")) {
            try {
                int days = Integer.parseInt(value);
                if (days <= 0) {
                    throw new BadRequestException("Threshold must be greater than zero.");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Threshold must be a valid integer.");
            }
        }

        Settings settings = settingsRepository.findBySettingKey(key)
                .orElseGet(() -> Settings.builder().settingKey(key).build());

        settings.setSettingValue(value);
        settingsRepository.save(settings);

        return DtoMapper.toSettingsDTO(settings);
    }

    public int getOverdueThresholdDays() {
        try {
            Settings settings = settingsRepository.findBySettingKey("overdue_threshold_days")
                    .orElse(null);
            if (settings != null) {
                return Integer.parseInt(settings.getSettingValue());
            }
        } catch (Exception e) {
            // Log fallback
        }
        return 5; // Default fallback threshold
    }
}

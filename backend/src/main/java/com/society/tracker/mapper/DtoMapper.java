package com.society.tracker.mapper;

import com.society.tracker.dto.*;
import com.society.tracker.entity.*;

public class DtoMapper {
    
    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .flatNumber(user.getFlatNumber())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static ComplaintDTO toComplaintDTO(Complaint complaint) {
        if (complaint == null) return null;
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .residentId(complaint.getResident().getId())
                .residentName(complaint.getResident().getFullName())
                .residentFlat(complaint.getResident().getFlatNumber())
                .residentEmail(complaint.getResident().getEmail())
                .category(complaint.getCategory())
                .description(complaint.getDescription())
                .imageUrl(complaint.getImageUrl())
                .priority(complaint.getPriority().name())
                .status(complaint.getStatus().name())
                .overdue(complaint.isOverdue())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    public static ComplaintHistoryDTO toComplaintHistoryDTO(ComplaintHistory history) {
        if (history == null) return null;
        return ComplaintHistoryDTO.builder()
                .id(history.getId())
                .complaintId(history.getComplaint().getId())
                .oldStatus(history.getOldStatus() != null ? history.getOldStatus().name() : null)
                .newStatus(history.getNewStatus().name())
                .note(history.getNote())
                .actorName(history.getActorName())
                .createdAt(history.getCreatedAt())
                .build();
    }

    public static NoticeDTO toNoticeDTO(Notice notice) {
        if (notice == null) return null;
        return NoticeDTO.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .description(notice.getDescription())
                .important(notice.isImportant())
                .expiryDate(notice.getExpiryDate())
                .createdBy(notice.getCreatedBy().getFullName())
                .createdAt(notice.getCreatedAt())
                .build();
    }

    public static SettingsDTO toSettingsDTO(Settings settings) {
        if (settings == null) return null;
        return new SettingsDTO(settings.getSettingKey(), settings.getSettingValue(), settings.getDescription());
    }
}

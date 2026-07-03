package com.society.tracker.service;

import com.society.tracker.dto.CreateNoticeRequest;
import com.society.tracker.dto.NoticeDTO;
import com.society.tracker.entity.Notice;
import com.society.tracker.entity.User;
import com.society.tracker.entity.UserRole;
import com.society.tracker.exception.ResourceNotFoundException;
import com.society.tracker.mapper.DtoMapper;
import com.society.tracker.repository.NoticeRepository;
import com.society.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public NoticeDTO createNotice(CreateNoticeRequest request, User creator) {
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .important(request.isImportant())
                .expiryDate(request.getExpiryDate())
                .createdBy(creator)
                .build();

        noticeRepository.save(notice);

        // Notify residents asynchronously if marked important
        if (notice.isImportant()) {
            List<User> residents = userRepository.findByRole(UserRole.RESIDENT);
            new Thread(() -> {
                for (User resident : residents) {
                    try {
                        emailService.sendImportantNoticeEmail(
                                resident.getEmail(),
                                resident.getFullName(),
                                notice.getTitle(),
                                notice.getDescription()
                        );
                    } catch (Exception e) {
                        System.err.println("Notice email broadcast failed for user " + resident.getEmail() + ": " + e.getMessage());
                    }
                }
            }).start();
        }

        return DtoMapper.toNoticeDTO(notice);
    }

    public List<NoticeDTO> getActiveNotices(String search) {
        String searchQuery = search != null ? search : "";
        return noticeRepository.findActiveNotices(LocalDateTime.now(), searchQuery).stream()
                .map(DtoMapper::toNoticeDTO)
                .collect(Collectors.toList());
    }

    public List<NoticeDTO> getAllNotices(String search) {
        String searchQuery = search != null ? search : "";
        return noticeRepository.findAllNotices(searchQuery).stream()
                .map(DtoMapper::toNoticeDTO)
                .collect(Collectors.toList());
    }

    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with ID: " + id));
        noticeRepository.delete(notice);
    }
}

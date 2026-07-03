package com.society.tracker.service;

import com.society.tracker.dto.*;
import com.society.tracker.entity.*;
import com.society.tracker.exception.BadRequestException;
import com.society.tracker.exception.ResourceNotFoundException;
import com.society.tracker.mapper.DtoMapper;
import com.society.tracker.repository.ComplaintHistoryRepository;
import com.society.tracker.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryRepository complaintHistoryRepository;
    private final SettingsService settingsService;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;

    public void checkAndUpdateOverdueComplaints() {
        int thresholdDays = settingsService.getOverdueThresholdDays();
        LocalDateTime overdueLimit = LocalDateTime.now().minusDays(thresholdDays);
        List<Complaint> activeComplaints = complaintRepository.findByStatusNot(ComplaintStatus.RESOLVED);
        
        for (Complaint complaint : activeComplaints) {
            boolean shouldBeOverdue = complaint.getCreatedAt().isBefore(overdueLimit);
            if (shouldBeOverdue != complaint.isOverdue()) {
                complaint.setOverdue(shouldBeOverdue);
                complaintRepository.save(complaint);
            }
        }
    }

    public ComplaintDTO createComplaint(CreateComplaintRequest request, MultipartFile file, User resident) {
        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            imageUrl = fileStorageService.storeFile(file);
        }

        Complaint complaint = Complaint.builder()
                .resident(resident)
                .category(request.getCategory())
                .description(request.getDescription())
                .imageUrl(imageUrl)
                .priority(ComplaintPriority.MEDIUM) // Default priority upon registration
                .status(ComplaintStatus.OPEN)
                .overdue(false)
                .build();

        complaintRepository.save(complaint);

        // Save initial history
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .oldStatus(null)
                .newStatus(ComplaintStatus.OPEN)
                .note("Complaint submitted by resident")
                .actorName(resident.getFullName())
                .build();
        complaintHistoryRepository.save(history);

        // Send email confirmation
        try {
            emailService.sendComplaintCreatedEmail(
                    resident.getEmail(),
                    resident.getFullName(),
                    complaint.getId(),
                    complaint.getCategory(),
                    complaint.getDescription()
            );
        } catch (Exception e) {
            System.err.println("Email creation notification failed: " + e.getMessage());
        }

        return DtoMapper.toComplaintDTO(complaint);
    }

    public Page<ComplaintDTO> getResidentComplaints(
            User resident, String status, String priority, Boolean overdue, String search, Pageable pageable
    ) {
        checkAndUpdateOverdueComplaints();

        ComplaintStatus statusEnum = (status != null && !status.isBlank()) ? ComplaintStatus.valueOf(status.toUpperCase()) : null;
        ComplaintPriority priorityEnum = (priority != null && !priority.isBlank()) ? ComplaintPriority.valueOf(priority.toUpperCase()) : null;
        String q = (search != null) ? search : "";

        // Customize pageable sorting to show overdue complaints first, then sort by date
        Sort sort = Sort.by(Sort.Order.desc("overdue"), Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        return complaintRepository.searchResidentComplaints(resident, statusEnum, priorityEnum, overdue, q, sortedPageable)
                .map(DtoMapper::toComplaintDTO);
    }

    public Page<ComplaintDTO> getAdminComplaints(
            String residentSearch, String status, String priority, Boolean overdue, String category, String search, Pageable pageable
    ) {
        checkAndUpdateOverdueComplaints();

        ComplaintStatus statusEnum = (status != null && !status.isBlank()) ? ComplaintStatus.valueOf(status.toUpperCase()) : null;
        ComplaintPriority priorityEnum = (priority != null && !priority.isBlank()) ? ComplaintPriority.valueOf(priority.toUpperCase()) : null;
        String cat = (category != null && !category.isBlank()) ? category : null;
        String res = (residentSearch != null && !residentSearch.isBlank()) ? residentSearch : null;
        String q = (search != null) ? search : "";

        Sort sort = Sort.by(Sort.Order.desc("overdue"), Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        return complaintRepository.searchAdminComplaints(res, statusEnum, priorityEnum, overdue, cat, q, sortedPageable)
                .map(DtoMapper::toComplaintDTO);
    }

    public ComplaintDTO getComplaintDetails(Long id, User currentUser) {
        checkAndUpdateOverdueComplaints();
        
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Security check: Residents can only see their own complaints
        if (currentUser.getRole() == UserRole.RESIDENT && !complaint.getResident().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to complaint details");
        }

        return DtoMapper.toComplaintDTO(complaint);
    }

    public List<ComplaintHistoryDTO> getComplaintHistory(Long id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Security check
        if (currentUser.getRole() == UserRole.RESIDENT && !complaint.getResident().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to complaint history");
        }

        return complaintHistoryRepository.findByComplaintOrderByCreatedAtDesc(complaint).stream()
                .map(DtoMapper::toComplaintHistoryDTO)
                .collect(Collectors.toList());
    }

    public ComplaintDTO adminUpdateComplaint(Long id, UpdateComplaintRequest request, User admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (complaint.getStatus() == ComplaintStatus.RESOLVED) {
            throw new BadRequestException("No updates are allowed on a resolved complaint.");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = ComplaintStatus.valueOf(request.getStatus().toUpperCase());
        ComplaintPriority newPriority = ComplaintPriority.valueOf(request.getPriority().toUpperCase());

        complaint.setStatus(newStatus);
        complaint.setPriority(newPriority);
        complaint.setUpdatedAt(LocalDateTime.now());

        // Recalculate overdue logic
        int thresholdDays = settingsService.getOverdueThresholdDays();
        LocalDateTime overdueLimit = LocalDateTime.now().minusDays(thresholdDays);
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setOverdue(false); // Resolved complaints are no longer overdue
        } else {
            complaint.setOverdue(complaint.getCreatedAt().isBefore(overdueLimit));
        }

        complaintRepository.save(complaint);

        // Record history logs
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(request.getNote())
                .actorName(admin.getFullName())
                .build();
        complaintHistoryRepository.save(history);

        // Send updates via email
        try {
            if (newStatus == ComplaintStatus.RESOLVED) {
                emailService.sendComplaintResolvedEmail(
                        complaint.getResident().getEmail(),
                        complaint.getResident().getFullName(),
                        complaint.getId(),
                        request.getNote()
                );
            } else {
                emailService.sendComplaintStatusUpdatedEmail(
                        complaint.getResident().getEmail(),
                        complaint.getResident().getFullName(),
                        complaint.getId(),
                        oldStatus.name(),
                        newStatus.name(),
                        request.getNote()
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to email update status notification: " + e.getMessage());
        }

        return DtoMapper.toComplaintDTO(complaint);
    }

    public DashboardStatsDTO getAdminDashboardStats() {
        checkAndUpdateOverdueComplaints();

        long total = complaintRepository.count();
        long open = complaintRepository.countByStatus(ComplaintStatus.OPEN);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long overdue = complaintRepository.countByOverdue(true);

        List<Object[]> categoryCounts = complaintRepository.countComplaintsByCategory();
        List<CategoryStatsDTO> catStats = categoryCounts.stream()
                .map(arr -> new CategoryStatsDTO((String) arr[0], (Long) arr[1]))
                .collect(Collectors.toList());

        List<Object[]> statusCounts = complaintRepository.countComplaintsByStatus();
        List<StatusStatsDTO> statStats = statusCounts.stream()
                .map(arr -> new StatusStatsDTO(((ComplaintStatus) arr[0]).name(), (Long) arr[1]))
                .collect(Collectors.toList());

        List<Object[]> priorityCounts = complaintRepository.countComplaintsByPriority();
        List<PriorityStatsDTO> prioStats = priorityCounts.stream()
                .map(arr -> new PriorityStatsDTO(((ComplaintPriority) arr[0]).name(), (Long) arr[1]))
                .collect(Collectors.toList());

        PageRequest pageRequest = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ComplaintDTO> latest = complaintRepository.findAll(pageRequest).getContent().stream()
                .map(DtoMapper::toComplaintDTO)
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalComplaints(total)
                .openComplaints(open)
                .inProgressComplaints(inProgress)
                .resolvedComplaints(resolved)
                .overdueComplaints(overdue)
                .complaintsByCategory(catStats)
                .complaintsByStatus(statStats)
                .complaintsByPriority(prioStats)
                .latestComplaints(latest)
                .build();
    }

    public ByteArrayInputStream exportComplaintsToExcel(
            String residentSearch, String status, String priority, Boolean overdue, String category, String search
    ) {
        checkAndUpdateOverdueComplaints();
        
        ComplaintStatus statusEnum = (status != null && !status.isBlank()) ? ComplaintStatus.valueOf(status.toUpperCase()) : null;
        ComplaintPriority priorityEnum = (priority != null && !priority.isBlank()) ? ComplaintPriority.valueOf(priority.toUpperCase()) : null;
        String cat = (category != null && !category.isBlank()) ? category : null;
        String res = (residentSearch != null && !residentSearch.isBlank()) ? residentSearch : null;
        String q = (search != null) ? search : "";

        List<Complaint> complaints = complaintRepository.filterAdminComplaints(res, statusEnum, priorityEnum, overdue, cat, q);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Complaints Report");

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Complaint ID", "Resident Name", "Resident Email", "Flat", "Category", "Description", "Priority", "Status", "Overdue", "Created At", "Updated At"};
            
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Complaint c : complaints) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getId());
                row.createCell(1).setCellValue(c.getResident().getFullName());
                row.createCell(2).setCellValue(c.getResident().getEmail());
                row.createCell(3).setCellValue(c.getResident().getFlatNumber());
                row.createCell(4).setCellValue(c.getCategory());
                row.createCell(5).setCellValue(c.getDescription());
                row.createCell(6).setCellValue(c.getPriority().name());
                row.createCell(7).setCellValue(c.getStatus().name());
                row.createCell(8).setCellValue(c.isOverdue() ? "YES" : "NO");
                row.createCell(9).setCellValue(c.getCreatedAt().toString());
                row.createCell(10).setCellValue(c.getUpdatedAt().toString());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate complaints Excel sheet: " + e.getMessage());
        }
    }
}

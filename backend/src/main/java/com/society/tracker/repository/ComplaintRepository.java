package com.society.tracker.repository;

import com.society.tracker.entity.Complaint;
import com.society.tracker.entity.ComplaintPriority;
import com.society.tracker.entity.ComplaintStatus;
import com.society.tracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    Page<Complaint> findByResident(User resident, Pageable pageable);
    
    @Query("SELECT c FROM Complaint c WHERE c.resident = :resident AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:priority IS NULL OR c.priority = :priority) AND " +
            "(:overdue IS NULL OR c.overdue = :overdue) AND " +
            "(LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> searchResidentComplaints(
            @Param("resident") User resident,
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("overdue") Boolean overdue,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
            "(:residentSearch IS NULL OR LOWER(c.resident.email) LIKE LOWER(CONCAT('%', :residentSearch, '%')) OR LOWER(c.resident.fullName) LIKE LOWER(CONCAT('%', :residentSearch, '%'))) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:priority IS NULL OR c.priority = :priority) AND " +
            "(:overdue IS NULL OR c.overdue = :overdue) AND " +
            "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
            "(LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> searchAdminComplaints(
            @Param("residentSearch") String residentSearch,
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("overdue") Boolean overdue,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
            "(:residentSearch IS NULL OR LOWER(c.resident.email) LIKE LOWER(CONCAT('%', :residentSearch, '%')) OR LOWER(c.resident.fullName) LIKE LOWER(CONCAT('%', :residentSearch, '%'))) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:priority IS NULL OR c.priority = :priority) AND " +
            "(:overdue IS NULL OR c.overdue = :overdue) AND " +
            "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
            "(LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Complaint> filterAdminComplaints(
            @Param("residentSearch") String residentSearch,
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("overdue") Boolean overdue,
            @Param("category") String category,
            @Param("search") String search);

    long countByResident(User resident);
    long countByResidentAndStatus(User resident, ComplaintStatus status);
    long countByResidentAndPriority(User resident, ComplaintPriority priority);
    long countByResidentAndOverdue(User resident, boolean overdue);
    
    long countByStatus(ComplaintStatus status);
    long countByOverdue(boolean overdue);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatus();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countComplaintsByPriority();

    List<Complaint> findByStatusNot(ComplaintStatus status);
}

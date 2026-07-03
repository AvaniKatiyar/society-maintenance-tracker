package com.society.tracker.repository;

import com.society.tracker.entity.Complaint;
import com.society.tracker.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {
    List<ComplaintHistory> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
}

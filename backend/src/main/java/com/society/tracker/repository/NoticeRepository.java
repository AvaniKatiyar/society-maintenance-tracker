package com.society.tracker.repository;

import com.society.tracker.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    @Query("SELECT n FROM Notice n WHERE (n.expiryDate IS NULL OR n.expiryDate > :now) AND " +
            "(LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY n.important DESC, n.createdAt DESC")
    List<Notice> findActiveNotices(@Param("now") LocalDateTime now, @Param("search") String search);
    
    @Query("SELECT n FROM Notice n WHERE " +
            "(LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY n.important DESC, n.createdAt DESC")
    List<Notice> findAllNotices(@Param("search") String search);
}

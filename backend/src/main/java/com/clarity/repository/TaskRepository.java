package com.clarity.repository;

import com.clarity.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByDueAtAsc(Long userId);
    List<Task> findByUserIdAndCompletedFalseOrderByDueAtAsc(Long userId);

    /** Used by the reminder scheduler */
    List<Task> findByReminderSentFalseAndRemindAtBefore(Instant now);
}

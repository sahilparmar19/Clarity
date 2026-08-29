package com.clarity.repository;

import com.clarity.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserIdAndEventDateBetweenOrderByEventDateAsc(Long userId, LocalDate from, LocalDate to);
    List<CalendarEvent> findByUserIdAndEventDateOrderByStartAtAsc(Long userId, LocalDate date);

    /** Counts events per month for a given year — used by the year-view heatmap */
    @Query("SELECT MONTH(e.eventDate) as month, COUNT(e) as total " +
           "FROM CalendarEvent e " +
           "WHERE e.user.id = :userId AND YEAR(e.eventDate) = :year " +
           "GROUP BY MONTH(e.eventDate)")
    List<Object[]> countByMonthForYear(Long userId, int year);

    /** Used by the reminder scheduler */
    List<CalendarEvent> findByReminderSentFalseAndRemindAtBefore(Instant now);
}

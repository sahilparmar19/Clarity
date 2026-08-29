package com.clarity.repository;

import com.clarity.model.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    Optional<DiaryEntry> findByUserIdAndDate(Long userId, LocalDate date);
    List<DiaryEntry> findByUserIdOrderByDateDesc(Long userId);
    List<DiaryEntry> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate from, LocalDate to);
}

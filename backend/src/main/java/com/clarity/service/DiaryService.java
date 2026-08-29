package com.clarity.service;

import com.clarity.model.DiaryEntry;
import com.clarity.model.User;
import com.clarity.repository.DiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryEntryRepository repo;
    private final PasswordEncoder passwordEncoder;

    /** Verify diary PIN before any diary operation */
    public void verifyPin(User user, String rawPin) {
        if (user.getDiaryPinHash() == null)
            throw new IllegalStateException("Diary PIN not set");
        if (!passwordEncoder.matches(rawPin, user.getDiaryPinHash()))
            throw new SecurityException("Wrong PIN");
    }

    public List<DiaryEntry> getAll(User user) {
        return repo.findByUserIdOrderByDateDesc(user.getId());
    }

    public List<DiaryEntry> getRange(User user, LocalDate from, LocalDate to) {
        return repo.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), from, to);
    }

    public DiaryEntry getByDate(User user, LocalDate date) {
        return repo.findByUserIdAndDate(user.getId(), date)
                .orElseThrow(() -> new RuntimeException("No entry for " + date));
    }

    @Transactional
    public DiaryEntry save(User user, LocalDate date, DiaryEntry incoming) {
        if (incoming.getBody() == null || incoming.getBody().isBlank())
            throw new IllegalArgumentException("Diary entry body must not be blank");
        DiaryEntry entry = repo.findByUserIdAndDate(user.getId(), date)
                .orElseGet(() -> DiaryEntry.builder().user(user).date(date).build());
        entry.setBody(incoming.getBody());
        entry.setMood(incoming.getMood());
        return repo.save(entry);
    }

    public void delete(User user, Long id) {
        DiaryEntry entry = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        if (!entry.getUser().getId().equals(user.getId()))
            throw new SecurityException("Access denied");
        repo.delete(entry);
    }
}

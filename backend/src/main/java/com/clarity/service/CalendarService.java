package com.clarity.service;

import com.clarity.model.CalendarEvent;
import com.clarity.model.User;
import com.clarity.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository repo;

    public List<CalendarEvent> getDay(User user, LocalDate date) {
        return repo.findByUserIdAndEventDateOrderByStartAtAsc(user.getId(), date);
    }

    public List<CalendarEvent> getRange(User user, LocalDate from, LocalDate to) {
        return repo.findByUserIdAndEventDateBetweenOrderByEventDateAsc(user.getId(), from, to);
    }

    /**
     * Returns a map of month (1–12) → event count for the year-view heatmap.
     * Months with no events are included with count 0.
     */
    public Map<Integer, Long> getYearHeatmap(User user, int year) {
        Map<Integer, Long> result = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) result.put(m, 0L);

        repo.countByMonthForYear(user.getId(), year)
            .forEach(row -> result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue()));

        return result;
    }

    public CalendarEvent create(User user, CalendarEvent event) {
        event.setUser(user);
        return repo.save(event);
    }

    public CalendarEvent update(User user, Long id, CalendarEvent patch) {
        CalendarEvent event = getOwned(user, id);
        if (patch.getTitle()       != null) event.setTitle(patch.getTitle());
        if (patch.getDescription() != null) event.setDescription(patch.getDescription());
        if (patch.getEventDate()   != null) event.setEventDate(patch.getEventDate());
        if (patch.getStartAt()     != null) event.setStartAt(patch.getStartAt());
        if (patch.getEndAt()       != null) event.setEndAt(patch.getEndAt());
        if (patch.getRemindAt()    != null) { event.setRemindAt(patch.getRemindAt()); event.setReminderSent(false); }
        if (patch.getType()        != null) event.setType(patch.getType());
        return repo.save(event);
    }

    public void delete(User user, Long id) {
        repo.delete(getOwned(user, id));
    }

    private CalendarEvent getOwned(User user, Long id) {
        CalendarEvent e = repo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getUser().getId().equals(user.getId())) throw new SecurityException("Access denied");
        return e;
    }
}

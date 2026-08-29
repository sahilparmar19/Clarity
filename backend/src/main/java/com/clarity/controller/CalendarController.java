package com.clarity.controller;

import com.clarity.model.CalendarEvent;
import com.clarity.model.User;
import com.clarity.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    /** Year-view: returns { 1: 4, 2: 0, ... 12: 7 } event counts per month */
    @GetMapping("/year/{year}")
    public Map<Integer, Long> getYearHeatmap(@AuthenticationPrincipal User user,
                                             @PathVariable int year) {
        return calendarService.getYearHeatmap(user, year);
    }

    @GetMapping("/day/{date}")
    public List<CalendarEvent> getDay(@AuthenticationPrincipal User user,
                                      @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return calendarService.getDay(user, date);
    }

    @GetMapping
    public List<CalendarEvent> getRange(@AuthenticationPrincipal User user,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendarService.getRange(user, from, to);
    }

    @PostMapping
    public ResponseEntity<CalendarEvent> create(@AuthenticationPrincipal User user,
                                                @RequestBody CalendarEvent event) {
        return ResponseEntity.ok(calendarService.create(user, event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarEvent> update(@AuthenticationPrincipal User user,
                                                @PathVariable Long id,
                                                @RequestBody CalendarEvent patch) {
        return ResponseEntity.ok(calendarService.update(user, id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user,
                                       @PathVariable Long id) {
        calendarService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}

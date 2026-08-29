package com.clarity.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "calendar_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** DATE for all-day events */
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    /** Null = all-day event */
    @Column(name = "start_at")
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    /** TASK | NOTE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type = EventType.NOTE;

    @Column(name = "remind_at")
    private Instant remindAt;

    @Column(name = "reminder_sent")
    private boolean reminderSent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist void onCreate() { createdAt = Instant.now(); }

    public enum EventType { TASK, NOTE }
}

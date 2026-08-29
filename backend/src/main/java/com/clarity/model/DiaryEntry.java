package com.clarity.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

/** A private diary entry – body is stored as plain text; the PIN check happens at API level */
@Entity
@Table(name = "diary_entries",
       uniqueConstraints = @UniqueConstraint(name = "uc_diary_user_date", columnNames = {"user_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** One entry per day (enforced by unique constraint) */
    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    /** Optional mood tag: HAPPY | NEUTRAL | SAD | ANXIOUS | EXCITED */
    @Enumerated(EnumType.STRING)
    private Mood mood;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist  void onCreate()  { createdAt = updatedAt = Instant.now(); }
    @PreUpdate   void onUpdate()  { updatedAt = Instant.now(); }

    public enum Mood { HAPPY, NEUTRAL, SAD, ANXIOUS, EXCITED }
}

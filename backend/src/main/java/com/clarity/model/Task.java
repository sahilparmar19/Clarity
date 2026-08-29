package com.clarity.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

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

    private boolean completed;

    /** Optional hard deadline */
    @Column(name = "due_at")
    private Instant dueAt;

    /** If set, the user gets an email reminder at this time */
    @Column(name = "remind_at")
    private Instant remindAt;

    @Column(name = "reminder_sent")
    private boolean reminderSent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist  void onCreate()  { createdAt = updatedAt = Instant.now(); }
    @PreUpdate   void onUpdate()  { updatedAt = Instant.now(); }
}

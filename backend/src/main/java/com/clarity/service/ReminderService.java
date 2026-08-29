package com.clarity.service;

import com.clarity.model.CalendarEvent;
import com.clarity.model.Task;
import com.clarity.repository.CalendarEventRepository;
import com.clarity.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Runs every minute and sends email reminders for due tasks/calendar events.
 * Marks reminder_sent = true so the email is sent only once.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final TaskRepository taskRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final JavaMailSender mailSender;

    @Scheduled(fixedDelay = 60_000)   // every 60 seconds
    @Transactional(noRollbackFor = Exception.class)
    public void sendTaskReminders() {
        List<Task> due = taskRepository.findByReminderSentFalseAndRemindAtBefore(Instant.now());
        for (Task task : due) {
            try {
                send(task.getUser().getEmail(),
                     "Clarity reminder: " + task.getTitle(),
                     "Hey! Just a reminder that your task \"" + task.getTitle() + "\" is due.\n\n" +
                     (task.getDescription() != null ? task.getDescription() : ""));
                task.setReminderSent(true);
                taskRepository.save(task);
            } catch (Exception e) {
                log.error("Failed to send task reminder for task {}", task.getId(), e);
            }
        }
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional(noRollbackFor = Exception.class)
    public void sendCalendarReminders() {
        List<CalendarEvent> due = calendarEventRepository.findByReminderSentFalseAndRemindAtBefore(Instant.now());
        for (CalendarEvent event : due) {
            try {
                send(event.getUser().getEmail(),
                     "Clarity reminder: " + event.getTitle(),
                     "Hey! Reminder for your event \"" + event.getTitle() + "\" on " + event.getEventDate() + ".\n\n" +
                     (event.getDescription() != null ? event.getDescription() : ""));
                event.setReminderSent(true);
                calendarEventRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to send calendar reminder for event {}", event.getId(), e);
            }
        }
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
        log.info("Reminder sent to {}", to);
    }
}

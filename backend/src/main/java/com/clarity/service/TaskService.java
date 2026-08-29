package com.clarity.service;

import com.clarity.model.Task;
import com.clarity.model.User;
import com.clarity.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAll(User user) {
        return taskRepository.findByUserIdOrderByDueAtAsc(user.getId());
    }

    public List<Task> getPending(User user) {
        return taskRepository.findByUserIdAndCompletedFalseOrderByDueAtAsc(user.getId());
    }

    public Task create(User user, Task task) {
        task.setUser(user);
        return taskRepository.save(task);
    }

    @Transactional
    public Task update(User user, Long id, Task patch) {
        Task task = getOwned(user, id);
        if (patch.getTitle()       != null) task.setTitle(patch.getTitle());
        if (patch.getDescription() != null) task.setDescription(patch.getDescription());
        if (patch.getDueAt()       != null) task.setDueAt(patch.getDueAt());
        if (patch.getRemindAt()    != null) { task.setRemindAt(patch.getRemindAt()); task.setReminderSent(false); }
        task.setCompleted(patch.isCompleted());
        return taskRepository.save(task);
    }

    public void delete(User user, Long id) {
        taskRepository.delete(getOwned(user, id));
    }

    private Task getOwned(User user, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!task.getUser().getId().equals(user.getId()))
            throw new SecurityException("Access denied");
        return task;
    }
}

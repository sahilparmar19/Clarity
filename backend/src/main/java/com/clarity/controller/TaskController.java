package com.clarity.controller;

import com.clarity.model.Task;
import com.clarity.model.User;
import com.clarity.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<Task> getAll(@AuthenticationPrincipal User user,
                             @RequestParam(defaultValue = "false") boolean pendingOnly) {
        return pendingOnly ? taskService.getPending(user) : taskService.getAll(user);
    }

    @PostMapping
    public ResponseEntity<Task> create(@AuthenticationPrincipal User user,
                                       @RequestBody Task task) {
        return ResponseEntity.ok(taskService.create(user, task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@AuthenticationPrincipal User user,
                                       @PathVariable Long id,
                                       @RequestBody Task patch) {
        return ResponseEntity.ok(taskService.update(user, id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user,
                                       @PathVariable Long id) {
        taskService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}

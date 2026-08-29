package com.clarity.controller;

import com.clarity.model.Project;
import com.clarity.model.User;
import com.clarity.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<Project> getAll(@AuthenticationPrincipal User user) {
        return projectService.getAll(user);
    }

    @PostMapping
    public ResponseEntity<Project> create(@AuthenticationPrincipal User user,
                                          @RequestBody Project project) {
        return ResponseEntity.ok(projectService.create(user, project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@AuthenticationPrincipal User user,
                                          @PathVariable Long id,
                                          @RequestBody Project patch) {
        return ResponseEntity.ok(projectService.update(user, id, patch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user,
                                       @PathVariable Long id) {
        projectService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}

package com.clarity.service;

import com.clarity.model.Project;
import com.clarity.model.User;
import com.clarity.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository repo;

    public List<Project> getAll(User user) {
        return repo.findByUserIdOrderByUpdatedAtDesc(user.getId());
    }

    public Project create(User user, Project project) {
        project.setUser(user);
        return repo.save(project);
    }

    public Project update(User user, Long id, Project patch) {
        Project p = getOwned(user, id);
        if (patch.getName()        != null) p.setName(patch.getName());
        if (patch.getDescription() != null) p.setDescription(patch.getDescription());
        if (patch.getStatus()      != null) p.setStatus(patch.getStatus());
        return repo.save(p);
    }

    public void delete(User user, Long id) {
        repo.delete(getOwned(user, id));
    }

    private Project getOwned(User user, Long id) {
        Project p = repo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        if (!p.getUser().getId().equals(user.getId())) throw new SecurityException("Access denied");
        return p;
    }
}

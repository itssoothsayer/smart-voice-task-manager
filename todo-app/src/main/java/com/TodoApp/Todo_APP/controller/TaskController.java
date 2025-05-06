package com.TodoApp.Todo_APP.controller;

import com.TodoApp.Todo_APP.dto.SummaryDTO;
import com.TodoApp.Todo_APP.dto.TaskRequestDTO;
import com.TodoApp.Todo_APP.dto.TaskResponseDTO;
import com.TodoApp.Todo_APP.service.TaskSearchService;
import com.TodoApp.Todo_APP.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    @Autowired
    private final TaskService taskService;

    // Get All Tasks
    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Get Task by ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Update Task
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO taskRequest) {
        return ResponseEntity.ok(taskService.updateTask(id, taskRequest));
    }

    // Delete Task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Mark Task Complete
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponseDTO> markComplete(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.markTaskCompleted(id));
    }

    // Mark Task Incomplete
    @PatchMapping("/{id}/incomplete")
    public ResponseEntity<TaskResponseDTO> markIncomplete(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.markTaskIncomplete(id));
    }


    // Filter by Priority
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskResponseDTO>> getByPriority(
            @PathVariable String priority) {
        return ResponseEntity.ok(taskService.getTasksByPriority(priority));
    }

    // Get Completed Tasks
    @GetMapping("/completed")
    public ResponseEntity<List<TaskResponseDTO>> getCompletedTasks() {
        return ResponseEntity.ok(taskService.getCompletedTasks());
    }

    // Get Incomplete Tasks
    @GetMapping("/incomplete")
    public ResponseEntity<List<TaskResponseDTO>> getIncompleteTasks() {
        return ResponseEntity.ok(taskService.getIncompleteTasks());
    }

    @Autowired
    private TaskSearchService taskSearchService;

    @GetMapping("/search")
    public ResponseEntity<List<TaskResponseDTO>> searchTasks(@RequestParam String query) {
        try {
            return ResponseEntity.ok(taskSearchService.searchTasks(query));
        } catch (IOException e) {
            throw new RuntimeException("Search failed: " + e.getMessage(), e);
        }
    }
}

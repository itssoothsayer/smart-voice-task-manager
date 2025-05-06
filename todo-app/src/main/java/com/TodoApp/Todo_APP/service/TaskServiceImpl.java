package com.TodoApp.Todo_APP.service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.TodoApp.Todo_APP.dto.SummaryDTO;
import com.TodoApp.Todo_APP.dto.TaskRequestDTO;
import com.TodoApp.Todo_APP.dto.TaskResponseDTO;
import com.TodoApp.Todo_APP.entity.Priority;
import com.TodoApp.Todo_APP.entity.Task;
import com.TodoApp.Todo_APP.exceptions.InvalidPriorityException;
import com.TodoApp.Todo_APP.exceptions.ResourceNotFoundException;
import com.TodoApp.Todo_APP.repository.TaskRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ModelMapper modelMapper;


    @Transactional(readOnly = true)
    @Override
    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(task -> modelMapper.map(task, TaskResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return modelMapper.map(task, TaskResponseDTO.class);
    }


    @Override
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest) {
        // Find existing task
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Update mutable fields
        if (taskRequest.getTitle() != null) {
            task.setTitle(taskRequest.getTitle());
        }
        if (taskRequest.getContent() != null) {
            task.setContent(taskRequest.getContent());
        }
        if (taskRequest.getPriority() != null) {
            task.setPriority(taskRequest.getPriority());
        }

        // Handle completion status change (with timestamp)
        if (taskRequest.getCompleted() != null) {
            boolean newStatus = taskRequest.getCompleted();
            task.setCompleted(newStatus);
            if (newStatus && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (!newStatus) {
                task.setCompletedAt(null);
            }
        }

        // Auto-update timestamp
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);
        return modelMapper.map(updatedTask, TaskResponseDTO.class);
    }

    @Override
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task", "id", id);
        }
        taskRepository.deleteById(id);
    }
    @Override
    public TaskResponseDTO markTaskCompleted(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Only update if changing from incomplete to complete
        if (!task.isCompleted()) {
            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now()); // Always set fresh timestamp
        }

        Task updatedTask = taskRepository.save(task);
        return modelMapper.map(updatedTask, TaskResponseDTO.class);
    }
    @Override
    public TaskResponseDTO markTaskIncomplete(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        task.setCompleted(false);
        Task updatedTask = taskRepository.save(task);

        return modelMapper.map(updatedTask, TaskResponseDTO.class);
    }

    @Override
    public List<TaskResponseDTO> getCompletedTasks() {
        return taskRepository.findByCompletedTrue().stream()
                .map(task -> modelMapper.map(task, TaskResponseDTO.class))
                .collect(Collectors.toList());
    }


    @Override
    public List<TaskResponseDTO> getIncompleteTasks() {
        return taskRepository.findByCompletedFalse().stream()
                .map(task -> modelMapper.map(task, TaskResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDTO> getTasksByPriority(String priorityStr) {
        Priority priority;
        try{
            priority = Priority.valueOf(priorityStr.toUpperCase());
        }catch (IllegalArgumentException e) {
            throw new InvalidPriorityException("Invalid priority value:" + " priorityStr");
        }
        return taskRepository.findByPriorityOrderByCreatedAtDesc(priority).stream()
                .map(task -> modelMapper.map(task, TaskResponseDTO.class))
                .collect(Collectors.toList());

    }
}
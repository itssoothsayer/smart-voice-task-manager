package com.TodoApp.Todo_APP.service;

import com.TodoApp.Todo_APP.dto.SummaryDTO;
import com.TodoApp.Todo_APP.dto.TaskRequestDTO;
import com.TodoApp.Todo_APP.dto.TaskResponseDTO;
import com.TodoApp.Todo_APP.entity.Priority;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TaskService {
    List<TaskResponseDTO> getAllTasks();
    TaskResponseDTO getTaskById(Long id);
    TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest);
    void deleteTask(Long id);


    TaskResponseDTO markTaskCompleted(Long id);
    TaskResponseDTO markTaskIncomplete(Long id);
    List<TaskResponseDTO> getCompletedTasks();
    List<TaskResponseDTO> getIncompleteTasks();
    List<TaskResponseDTO> getTasksByPriority(String priority);
}

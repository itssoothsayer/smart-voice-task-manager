package com.TodoApp.Todo_APP.repository;

import com.TodoApp.Todo_APP.entity.Priority;
import com.TodoApp.Todo_APP.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task,Long> {

    // Custom query example - find all tasks ordered by creation date (newest first)
    List<Task> findAllByOrderByCreatedAtDesc();

    // Custom query example - find tasks by priority
    List<Task> findByPriorityOrderByCreatedAtDesc(Priority priority);
    List<Task> findByCompletedTrue();
    List<Task> findByCompletedFalse();
}

package com.TodoApp.Todo_APP.dto;

import com.TodoApp.Todo_APP.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequestDTO {
    @Size(max = 100, message = "Title must be less than 100 Characters")
    private String title;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    private Boolean completed;
    private Priority priority; // Make sure this is included
}
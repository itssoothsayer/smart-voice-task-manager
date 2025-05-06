package com.TodoApp.Todo_APP.service;

import com.TodoApp.Todo_APP.dto.UserRequestDTO;
import com.TodoApp.Todo_APP.dto.UserResponseDTO;

public interface UserService {
    String authenticate(UserRequestDTO request);
    UserResponseDTO createUser(UserRequestDTO request);
}

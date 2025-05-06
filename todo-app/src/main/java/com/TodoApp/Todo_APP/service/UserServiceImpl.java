package com.TodoApp.Todo_APP.service;

import com.TodoApp.Todo_APP.dto.UserRequestDTO;
import com.TodoApp.Todo_APP.dto.UserResponseDTO;
import com.TodoApp.Todo_APP.entity.User;
import com.TodoApp.Todo_APP.exceptions.AuthenticationException;
import com.TodoApp.Todo_APP.exceptions.ResourceNotFoundException;
import com.TodoApp.Todo_APP.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        System.out.println("Registering user: " + request.getEmail() + ", Hashed password: " + user.getPassword());
        userRepository.save(user);
        return modelMapper.map(user, UserResponseDTO.class);
    }
    @Override
    public String authenticate(UserRequestDTO request) {
        System.out.println("Authenticating user: " + request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + request.getEmail());
                    return new IllegalArgumentException("Invalid email or password");
                });
        System.out.println("Stored hashed password: " + user.getPassword() + ", Provided password: " + request.getPassword());
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            System.out.println("Password mismatch for user: " + request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        System.out.println("Generated JWT for user: " + user.getEmail() + ", Token: " + token);
        return token;
    }
}
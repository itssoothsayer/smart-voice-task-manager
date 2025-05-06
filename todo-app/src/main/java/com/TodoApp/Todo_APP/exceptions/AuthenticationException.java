package com.TodoApp.Todo_APP.exceptions;

import org.springframework.http.HttpStatus;

public class AuthenticationException extends ApiException {
    public AuthenticationException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
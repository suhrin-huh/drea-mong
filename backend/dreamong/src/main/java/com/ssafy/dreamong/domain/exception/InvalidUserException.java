package com.ssafy.dreamong.domain.exception;

public class InvalidUserException extends RuntimeException {
    public InvalidUserException(String message) {
        super(message);
    }

    public InvalidUserException() {
        this("Invalid user");
    }
}

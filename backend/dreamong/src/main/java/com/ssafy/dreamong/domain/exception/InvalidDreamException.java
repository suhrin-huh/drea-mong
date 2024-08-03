package com.ssafy.dreamong.domain.exception;

public class InvalidDreamException extends RuntimeException {
    public InvalidDreamException(String message) {
        super(message);
    }

    public InvalidDreamException() {
        this("Invalid Dream Exception");
    }
}

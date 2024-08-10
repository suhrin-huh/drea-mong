package com.ssafy.dreamong.domain.exception;

public class NicknameAlreadyExistsException extends RuntimeException {
    public NicknameAlreadyExistsException(String message) {
        super(message);
    }

    public NicknameAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}

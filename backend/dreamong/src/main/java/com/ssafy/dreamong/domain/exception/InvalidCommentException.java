package com.ssafy.dreamong.domain.exception;

public class InvalidCommentException extends RuntimeException {
    public InvalidCommentException(String message) {
        super(message);
    }

    public InvalidCommentException() {
        this("invalid comment");
    }
}

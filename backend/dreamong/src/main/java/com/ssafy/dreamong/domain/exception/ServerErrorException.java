package com.ssafy.dreamong.domain.exception;

public class ServerErrorException extends RuntimeException {
    public ServerErrorException(String message) {
        super(message);
    }

    public ServerErrorException() {
        this("Server error");
    }
}

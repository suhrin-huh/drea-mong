package com.ssafy.dreamong.domain.exception;

public class UnauthenticatedException extends RuntimeException{
    public UnauthenticatedException(String message) {
        super(message);
    }

    public UnauthenticatedException() {
        this("Unauthenticated");
    }
}

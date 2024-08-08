package com.ssafy.dreamong.domain.exception;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(Integer romeId) {
        super("Room id not found : " + romeId);

    }

    public RoomNotFoundException() {
    }
}

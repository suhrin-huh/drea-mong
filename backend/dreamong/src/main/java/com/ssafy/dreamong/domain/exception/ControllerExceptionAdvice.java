package com.ssafy.dreamong.domain.exception;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ControllerExceptionAdvice {

    @ExceptionHandler
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        return new ResponseEntity<>(ApiResponse.error("Server Error: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR); // 500
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<?>> handleBadRequestException(BadRequestException e) {
        return new ResponseEntity<>(ApiResponse.error("Bad Request: " + e.getMessage()), HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ApiResponse<?>> handleUnauthenticatedException(UnauthenticatedException e) {
        return new ResponseEntity<>(ApiResponse.error("Unauthenticated: " + e.getMessage()), HttpStatus.UNAUTHORIZED); // 401
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<?>> handleForbiddenException(ForbiddenException e) {
        return new ResponseEntity<>(ApiResponse.error("Forbidden: " + e.getMessage()), HttpStatus.FORBIDDEN); // 403
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFoundException(NotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error("Not Found: " + e.getMessage()), HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(InvalidCommentException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidCommentException(InvalidCommentException e) {
        return new ResponseEntity<>(ApiResponse.error("Invalid Comment: " + e.getMessage()), HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(InvalidUserException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidUserException(InvalidUserException e) {
        return new ResponseEntity<>(ApiResponse.error("Invalid User: " + e.getMessage()), HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(InvalidDreamException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidDreamException(InvalidDreamException e) {
        return new ResponseEntity<>(ApiResponse.error("Invalid Dream: " + e.getMessage()), HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleRoomNotFoundException(RoomNotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error("Room not found: " + e.getMessage()), HttpStatus.NOT_FOUND); // 404
    }
}

package com.ssafy.dreamong.domain.exception.global;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ControllerExceptionAdvice {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<?>> handleBadRequestException(BadRequestException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ApiResponse<?>> handleUnauthenticatedException(UnauthenticatedException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<?>> handleForbiddenException(ForbiddenException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFoundException(NotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidCommentException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidCommentException(InvalidCommentException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidUserException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidUserException(InvalidUserException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidDreamException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidDreamException(InvalidDreamException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleRoomNotFoundException(RoomNotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleUserNotFoundException(UserNotFoundException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(NicknameAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<?>> handleNicknameAlreadyExistsException(NicknameAlreadyExistsException e) {
        return new ResponseEntity<>(ApiResponse.error(), HttpStatus.CONFLICT); // 409
    }
}

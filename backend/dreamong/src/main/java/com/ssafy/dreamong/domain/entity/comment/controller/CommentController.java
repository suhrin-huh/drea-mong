package com.ssafy.dreamong.domain.entity.comment.controller;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.service.CommentService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    // 댓글 생성
    @PostMapping(value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> createComment(@RequestBody CommentRequest request) {
        commentService.createComment(request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    // 좋아요 토글
    @PostMapping(value = "/{userId}/{commentId}/like", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> likeComment(@PathVariable Integer userId, @PathVariable Integer commentId) {
        boolean isLike = commentService.toggleCommentLike(userId, commentId);
        return ResponseEntity.ok(isLike ? ApiResponse.success() : ApiResponse.error());
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<?>> deleteComment(@PathVariable Integer commentId) {
        boolean isDeleted = commentService.deleteComment(commentId);
        return ResponseEntity.ok(isDeleted ? ApiResponse.success() : ApiResponse.error());
    }
}

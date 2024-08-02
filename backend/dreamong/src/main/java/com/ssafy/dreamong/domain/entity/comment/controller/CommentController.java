package com.ssafy.dreamong.domain.entity.comment.controller;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.service.CommentService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    //댓글 생성
    @PostMapping(value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> createComment(@RequestBody CommentRequest request) {
        try {
            commentService.createComment(request);
            return ApiResponse.success(null, "Comment created successfully");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    //좋아요 토글
    @PostMapping(value = "/{userId}/{commentId}/like", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> likeComment(@PathVariable Integer userId, @PathVariable Integer commentId) {
        boolean isLike = commentService.toggleCommentLike(userId, commentId);
        String message = isLike ? "comment like" : "comment unLike ";
        return ApiResponse.success(null, message);
    }

    //댓글 삭제
    @DeleteMapping("/{commentId}")
    public ApiResponse<?> deleteComment(@PathVariable Integer commentId) {
        boolean isDeleted = commentService.deleteComment(commentId);
        if (isDeleted) {
            return ApiResponse.success(null, "Comment deleted successfully");
        } else {
            return ApiResponse.error("Comment deletion failed");
        }
    }
}

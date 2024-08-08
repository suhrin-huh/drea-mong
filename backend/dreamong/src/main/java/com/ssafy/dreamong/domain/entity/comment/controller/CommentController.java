package com.ssafy.dreamong.domain.entity.comment.controller;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.service.CommentService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "댓글 API")
public class CommentController {
    private final CommentService commentService;

    @Operation(summary = "댓글 등록", description = "꿈 광장에 등록된 게시글에 댓글을 단다.")
    @PostMapping(value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> createComment(
            @Parameter(description = "댓글 요청 데이터", required = true) @RequestBody CommentRequest request) {
        commentService.createComment(request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "댓글 좋아요 토글", description = "댓글을 좋아요와 좋아요 취소를 한다.")
    @PostMapping(value = "/{userId}/{commentId}/like", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> likeComment(
            @Parameter(description = "사용자 ID", required = true) @PathVariable Integer userId,
            @Parameter(description = "댓글 ID", required = true) @PathVariable Integer commentId) {
        boolean isLike = commentService.toggleCommentLike(userId, commentId);
        return ResponseEntity.ok(isLike ? ApiResponse.success() : ApiResponse.error());
    }

    @Operation(summary = "댓글 삭제", description = "등록된 댓글을 삭제 한다.")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<?>> deleteComment(
            @Parameter(description = "댓글 ID", required = true) @PathVariable Integer commentId) {
        boolean isDeleted = commentService.deleteComment(commentId);
        return ResponseEntity.ok(isDeleted ? ApiResponse.success() : ApiResponse.error());
    }
}

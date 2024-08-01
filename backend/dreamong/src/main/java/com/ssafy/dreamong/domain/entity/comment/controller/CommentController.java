package com.ssafy.dreamong.domain.entity.comment.controller;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.dto.CommentUpdateLikesDto;
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

    @PostMapping(value = "/create", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> createComment(@RequestBody CommentRequest request) {
        System.out.println("Received CommentRequest: " + request);

        try {
            commentService.createComment(request);
            return ApiResponse.success(null, "Comment created successfully");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping(value = "/{userId}/{dreamId}/{commentId}/like", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> likeComment(@PathVariable Integer userId, @PathVariable Integer dreamId, @PathVariable Integer commentId) {
        commentService.incrementCommentLikes(userId, dreamId, commentId);
        return ApiResponse.success(null, "Comment liked");
    }

    @PostMapping(value = "/{userId}/{dreamId}/{commentId}/unlike", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> unlikeComment(@PathVariable Integer userId, @PathVariable Integer dreamId, @PathVariable Integer commentId) {
        commentService.decrementCommentLikes(userId, dreamId, commentId);
        return ApiResponse.success(null, "Comment unliked");
    }

}

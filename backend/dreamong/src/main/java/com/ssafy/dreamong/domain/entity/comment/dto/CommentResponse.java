package com.ssafy.dreamong.domain.entity.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentResponse {
    private Integer id;
    private String content;
    private Integer likesCount;
    private String nickname;
    private boolean isCommentOwner;
}

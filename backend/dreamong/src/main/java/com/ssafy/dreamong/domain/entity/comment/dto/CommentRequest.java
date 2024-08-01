package com.ssafy.dreamong.domain.entity.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentRequest {
    private String content;
    private Integer dreamId;
    private Integer userId;
}

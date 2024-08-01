package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentResponse {
    private Integer id;
    private String content;
    private Integer likesCount;
}

package com.ssafy.dreamong.domain.entity.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentUpdateLikesDto {
    private Integer userId;
    private Integer dreamId;
    private Integer commentId;
    private Integer likesCount;
}

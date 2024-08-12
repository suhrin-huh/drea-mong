package com.ssafy.dreamong.domain.entity.dream.dto;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SquareDetailResponse {
    private String summary;
    private String content;
    private String image;
    private List<CommentResponse> comments;
}

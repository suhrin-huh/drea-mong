package com.ssafy.dreamong.domain.entity.dream.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DreamCreateRequest {
    private String content;
    private String image;
    private String interpretation;
    private Integer userId;
    private boolean isShared;
    private String writeTime;
}


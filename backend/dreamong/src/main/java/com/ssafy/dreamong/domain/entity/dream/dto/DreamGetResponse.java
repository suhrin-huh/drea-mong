package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DreamGetResponse {

    private String content;

    private String image;

    private String interpretation;

    private String summary;

    private boolean isShared;


    private Integer userId;

    private String writeTime;
}

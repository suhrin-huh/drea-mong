package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DreamMainResponse {

    private Integer dreamId;

    private String content;

    private String image;

    private String writeTime;
}

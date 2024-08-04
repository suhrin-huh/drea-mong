package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DreamUpdateLikesDto {
    private Integer dreamId;
    private Integer likesCount;
}

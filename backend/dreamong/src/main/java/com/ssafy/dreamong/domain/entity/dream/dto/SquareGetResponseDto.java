package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SquareGetResponseDto {
    private Integer dreamId;
    private Integer userId;
    private String image;
}

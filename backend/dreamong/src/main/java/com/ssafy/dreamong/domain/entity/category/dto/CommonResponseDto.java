package com.ssafy.dreamong.domain.entity.category.dto;

import com.ssafy.dreamong.domain.entity.category.Type;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommonResponseDto {
    private String word;
    private Type type;
}

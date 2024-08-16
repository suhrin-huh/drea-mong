package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DreamCategoryDto {
    private Integer id;
    private String categoryWord;
    private String categoryType;
}

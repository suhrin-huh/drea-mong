package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DreamDto {
    private Integer id;
    private String content;
    private String image;
    private String interpretation;
    private String summary;
    private boolean isShared;
    private Integer userId;
    private String writeTime;
    private List<DreamCategoryDto> dreamCategories;
}

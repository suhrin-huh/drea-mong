package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DreamUpdateRequest {

    private String id;

    private String content;

    private String image;

    private String interpretation;

    private String summary;

    private String writeTime;

    private boolean isShared;

    private List<DreamCategoryDto> dreamCategories;
}

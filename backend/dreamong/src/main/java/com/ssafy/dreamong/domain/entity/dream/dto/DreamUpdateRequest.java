package com.ssafy.dreamong.domain.entity.dream.dto;

import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
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

    private List<DreamCategory> dreamCategories;
}

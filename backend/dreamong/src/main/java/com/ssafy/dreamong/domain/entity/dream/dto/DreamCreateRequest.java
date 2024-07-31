package com.ssafy.dreamong.domain.entity.dream.dto;


import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DreamCreateRequest {

    private String content;

    private String image;

    private String interpretation;

    private String summary;

    private Integer userId;

    private String writeTime;

    private List<DreamCategory> dreamCategories;
}

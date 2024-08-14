package com.ssafy.dreamong.domain.entity.category.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CategoryResponseDto {

    private Integer userId;

    private List<CommonResponseDto> moods;

    private List<CommonResponseDto> characters;

    private List<CommonResponseDto> locations;

    private List<ObjectResponseDto> objects;

    private List<DreamTypeCountDto> dreamTypeCounts;
}

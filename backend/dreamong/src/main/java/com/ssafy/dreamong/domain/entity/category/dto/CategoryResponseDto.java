package com.ssafy.dreamong.domain.entity.category.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CategoryResponseDto {

    private List<DreamTypeResponseDto> dreamType;

    private List<MoodResponseDto> moods;

    private List<CharacterResponseDto> characters;

    private List<LocationResponseDto> locations;

    private List<ObjectResponseDto> objects;

    private List<DreamTypeCountDto> dreamTypeCounts;
}

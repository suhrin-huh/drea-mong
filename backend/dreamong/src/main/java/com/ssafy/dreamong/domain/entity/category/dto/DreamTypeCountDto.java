package com.ssafy.dreamong.domain.entity.category.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DreamTypeCountDto {
    private String dreamType;
    private Long count;
}

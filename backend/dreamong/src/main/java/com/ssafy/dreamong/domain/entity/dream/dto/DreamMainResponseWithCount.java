package com.ssafy.dreamong.domain.entity.dream.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DreamMainResponseWithCount {
    private List<DreamMainResponse> dreamMainResponsesList;

    private long totalCount;
}

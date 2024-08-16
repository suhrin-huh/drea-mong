package com.ssafy.dreamong.domain.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Translation {
    private String detected_source_language;
    private String text;
}

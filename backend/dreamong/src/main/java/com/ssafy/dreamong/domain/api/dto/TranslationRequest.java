package com.ssafy.dreamong.domain.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TranslationRequest {
    private List<String> text;
    private String target_lang;
}

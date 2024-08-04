package com.ssafy.dreamong.domain.entity.category.controller;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.category.dto.CategoryDto;
import com.ssafy.dreamong.domain.entity.category.service.CategoryService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<Type, List<CategoryDto>>>> getTop3CategoriesByType() {
        Map<Type, List<CategoryDto>> topCategoriesByType = categoryService.getTop3CategoriesByType();
        return ResponseEntity.ok(ApiResponse.success(topCategoriesByType, "Successfully retrieved top 3 categories by type"));
    }
}

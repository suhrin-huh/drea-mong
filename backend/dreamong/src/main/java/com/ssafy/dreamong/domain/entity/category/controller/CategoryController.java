package com.ssafy.dreamong.domain.entity.category.controller;

import com.ssafy.dreamong.domain.entity.category.dto.CategoryResponseDto;
import com.ssafy.dreamong.domain.entity.category.service.CategoryService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/{userId}/{currentDate}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> getCategoryDataByUserAndDate(
            @PathVariable Integer userId, @PathVariable String currentDate) {
        CategoryResponseDto categoryData = categoryService.getCategoryDataByUserAndDate(userId, currentDate);
        return ResponseEntity.ok(ApiResponse.success(categoryData, "Successfully retrieved category data by user and date"));
    }
}

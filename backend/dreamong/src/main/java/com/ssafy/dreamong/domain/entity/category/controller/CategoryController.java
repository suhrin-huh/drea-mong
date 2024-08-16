package com.ssafy.dreamong.domain.entity.category.controller;

import com.ssafy.dreamong.domain.entity.category.dto.CategoryResponseDto;
import com.ssafy.dreamong.domain.entity.category.service.CategoryService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Tag(name = "Category", description = "카테고리 API")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "통계 페이지 조회", description = "한달간 카테고리별 통계를 제공한다.")
    @GetMapping("/{userId}/{currentDate}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> getCategoryDataByUserAndDate(
            @Parameter(description = "사용자 ID", required = true) @PathVariable Integer userId,
            @Parameter(description = "현재 날짜", required = true) @PathVariable String currentDate) {
        CategoryResponseDto categoryData = categoryService.getCategoryDataByUserAndDate(userId, currentDate);
        return ResponseEntity.ok(ApiResponse.success(categoryData));
    }
}

package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
import com.ssafy.dreamong.domain.entity.dream.service.SquareService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/square")
@RequiredArgsConstructor
public class SquareController {

    private final SquareService squareService;
    private final DreamService dreamService;

    // 꿈 광장 조회
    @GetMapping(value = "/dreams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> getAllSharedDreams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate,desc") String sort) {

        Page<SquareGetResponseDto> sharedDreams = squareService.getAllSharedDreams(page, size, sort);

        if (sharedDreams.isEmpty()) {
            return ApiResponse.error("No shared dreams found");
        } else {
            return ApiResponse.success(sharedDreams, "Shared dreams retrieved successfully");
        }
    }

    // 꿈 광장 상세 보기
    @GetMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> getDreamDetail(@PathVariable Integer dreamId, @RequestParam Integer userId) {
        SquareDetailResponse dreamDetail = squareService.getDreamDetail(dreamId, userId);
        return ApiResponse.success(dreamDetail, "Dream detail retrieved successfully");
    }
}

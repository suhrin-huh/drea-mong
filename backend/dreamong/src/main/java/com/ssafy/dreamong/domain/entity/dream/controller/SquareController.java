package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
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

    @GetMapping(value = "/dreams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> getAllSharedDreams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate,desc") String sort) {

        // 서비스 메소드를 통해 페이징된 결과 조회
        Page<SquareGetResponseDto> sharedDreams = squareService.getAllSharedDreams(page, size, sort);

        // 결과가 비어있을 경우 에러 메시지 반환
        if (sharedDreams.isEmpty()) {
            return ApiResponse.error("No shared dreams found");
        } else {
            return ApiResponse.success(sharedDreams, "Shared dreams retrieved successfully");
        }
    }

    @GetMapping(value = "/{userId}/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> getDreamDetail(@PathVariable Integer userId, @PathVariable Integer dreamId) {
        SquareDetailResponse dreamDetail = squareService.getDreamDetail(userId, dreamId);
        if (dreamDetail == null) {
            return ApiResponse.error("Dream not found or access denied");
        } else {
            return ApiResponse.success(dreamDetail, "Dream retrieved successfully");
        }
    }
}

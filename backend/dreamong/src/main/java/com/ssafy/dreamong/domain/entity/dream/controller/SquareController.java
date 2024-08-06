package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
import com.ssafy.dreamong.domain.entity.dream.service.SquareService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/square")
@RequiredArgsConstructor
public class SquareController {

    private final SquareService squareService;

    //꿈 광장 조회
    @GetMapping(value = "/dreams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> getAllSharedDreams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate,desc") String sort) {

        Page<SquareGetResponseDto> sharedDreams = squareService.getAllSharedDreams(page, size, sort);

        return ResponseEntity.ok(ApiResponse.success(sharedDreams));
    }

    //꿈 광장 상세보기
    @GetMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> getDreamDetail(@PathVariable Integer dreamId, @RequestParam Integer userId) {
        SquareDetailResponse dreamDetail = squareService.getDreamDetail(dreamId, userId);
        return ResponseEntity.ok(ApiResponse.success(dreamDetail));
    }
}

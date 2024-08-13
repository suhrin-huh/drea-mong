package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
import com.ssafy.dreamong.domain.entity.dream.service.SquareService;
import com.ssafy.dreamong.domain.oauth.dto.CustomOAuth2User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/square")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Square", description = "꿈 광장 API")
public class SquareController {

    private final SquareService squareService;

    @Operation(summary = "꿈 광장 조회", description = "꿈 공유가 true인 것만 보여준다.")
    @GetMapping(value = "/dreams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> getAllSharedDreams(
            @Parameter(description = "커서 ID", required = false) @RequestParam(required = false) Integer cursorId,
            @Parameter(description = "가져올 사이즈", required = false) @RequestParam(defaultValue = "10") int size) {

        List<SquareGetResponseDto> sharedDreams = squareService.getAllSharedDreams(cursorId, size);

        return ResponseEntity.ok(ApiResponse.success(sharedDreams));
    }

    @Operation(summary = "꿈 광장 상세보기", description = "꿈 광장에서 선택한 글을 상세하게 본다.")
    @GetMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> getDreamDetail(
            @Parameter(description = "꿈 ID", required = true) @PathVariable Integer dreamId,
            @Parameter(description = "사용자 ID", required = true) @RequestParam Integer userId) {
        SquareDetailResponse dreamDetail = squareService.getDreamDetail(dreamId, userId);
        return ResponseEntity.ok(ApiResponse.success(dreamDetail));
    }

}

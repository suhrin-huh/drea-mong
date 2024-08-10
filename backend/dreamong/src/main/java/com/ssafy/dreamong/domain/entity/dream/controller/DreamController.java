package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.*;
import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dream")
@RequiredArgsConstructor
@Tag(name = "Dream", description = "꿈 API")
public class DreamController {

    private final DreamService dreamService;

    @Operation(summary = "메인 페이지 조회", description = "사용자가 등록한 꿈을 년도와 월을 선택하여 본다.")
    @GetMapping(value = "/{userId}/{writeTime}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> findAll(
            @Parameter(description = "사용자 ID", required = true) @PathVariable Integer userId,
            @Parameter(description = "작성 시간", required = true) @PathVariable String writeTime) {
        DreamMainResponseWithCount response = dreamService.getDreamsByUserIdAndWriteTime(userId, writeTime);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "꿈을 등록한다.", description = "사용자가 꿈을 등록한다.")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> createDream(
            @Parameter(description = "꿈 생성 요청 데이터", required = true) @RequestBody DreamCreateRequest dreamCreateRequest) {
        DreamDto dream = dreamService.create(dreamCreateRequest);
        return ResponseEntity.ok(ApiResponse.success(dream));
    }

    @Operation(summary = "꿈 상세보기", description = "메인페이지의 리스트중 하나를 선택하여 상세하게 본다.")
    @GetMapping("/{dreamId}")
    public ResponseEntity<ApiResponse<?>> getDream(
            @Parameter(description = "꿈 ID", required = true) @PathVariable Integer dreamId) {
        DreamGetResponse dreamGetResponse = dreamService.getDream(dreamId);
        return ResponseEntity.ok(ApiResponse.success(dreamGetResponse));
    }

    @Operation(summary = "꿈 수정", description = "등록한 꿈을 수정한다.")
    @PutMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> update(
            @Parameter(description = "꿈 ID", required = true) @PathVariable Integer dreamId,
            @Parameter(description = "꿈 수정 요청 데이터", required = true) @RequestBody DreamUpdateRequest request) {
        dreamService.update(dreamId, request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "꿈 삭제", description = "등록된 꿈을 삭제한다.")
    @DeleteMapping("/{dreamId}")
    public ResponseEntity<ApiResponse<?>> delete(
            @Parameter(description = "꿈 ID", required = true) @PathVariable Integer dreamId) {
        boolean isDeleted = dreamService.deleteDream(dreamId);
        return ResponseEntity.ok(isDeleted
                ? ApiResponse.success()
                : ApiResponse.error());
    }

    @Operation(summary = "꿈 임시 저장", description = "사용자가 꿈을 임시 저장 한다.")
    @PostMapping(value = "/temporary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> temporaryDream(
            @Parameter(description = "임시 저장 꿈 생성 요청 데이터", required = true) @RequestBody DreamCreateRequest dreamCreateRequest) {
        dreamService.createTemporaryDream(dreamCreateRequest);
        return ResponseEntity.ok(ApiResponse.success());
    }
}

package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.*;
import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dream")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService dreamService;

    //메인 조회
    @GetMapping(value = "/{userId}/{writeTime}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> findAll(@PathVariable Integer userId, @PathVariable String writeTime) {
        List<DreamMainResponse> dreamMainResponseList = dreamService.getDreamsByUserIdAndWriteTime(userId, writeTime);
        return ResponseEntity.ok(ApiResponse.success(dreamMainResponseList));
    }

    //꿈 등록
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<?>> createDream(@RequestBody DreamCreateRequest dreamCreateRequest) {
        DreamDto createdDream = dreamService.create(dreamCreateRequest);
        return ResponseEntity.ok(ApiResponse.success(createdDream));
    }

    //상세 보기
    @GetMapping("/{dreamId}")
    public ResponseEntity<ApiResponse<?>> getDream(@PathVariable Integer dreamId) {
        DreamGetResponse dreamGetResponse = dreamService.getDream(dreamId);
        return ResponseEntity.ok(ApiResponse.success(dreamGetResponse));
    }

    //꿈 수정
    @PutMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Integer dreamId, @RequestBody DreamUpdateRequest request) {
        DreamDto updatedDream = dreamService.update(dreamId, request);
        return ResponseEntity.ok(ApiResponse.success(updatedDream));
    }

    //꿈 삭제
    @DeleteMapping("/{dreamId}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Integer dreamId) {
        boolean isDeleted = dreamService.deleteDream(dreamId);
        return ResponseEntity.ok(isDeleted
                ? ApiResponse.success()
                : ApiResponse.error());
    }

    //꿈 임시 저장
    @PostMapping(value = "/temporary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<?>> temporaryDream(@RequestBody DreamCreateRequest dreamCreateRequest) {
        DreamDto temporaryDream = dreamService.createTemporaryDream(dreamCreateRequest);
        return ResponseEntity.ok(ApiResponse.success(temporaryDream));
    }
}

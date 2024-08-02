package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.*;
import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/dream")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService dreamService;
    
    //리스트 조회
    @GetMapping(value = "/{userId}/{writeTime}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> findAll(@PathVariable Integer userId, @PathVariable String writeTime) {
        List<DreamMainResponse> dreamMainResponseList = dreamService.getDreamsByUserIdAndWriteTime(userId, writeTime);
        if (dreamMainResponseList.isEmpty()) {
            return ApiResponse.error("DreamList is empty");
        } else {
            return ApiResponse.success(dreamMainResponseList, "Dreams retrieved successfully");
        }
    }

    //꿈 생성
    @PostMapping("/create")
    public ApiResponse<?> createDream(@RequestBody DreamCreateRequest dreamCreateRequest) {
        DreamDto createdDream = dreamService.create(dreamCreateRequest);
        if (createdDream == null) {
            return ApiResponse.error("Dream creation failed");
        } else {
            return ApiResponse.success(createdDream, "Dream created successfully");
        }
    }
    
    //상세 보기
    @GetMapping("/{dreamId}")
    public ApiResponse<?> getDream(@PathVariable Integer dreamId) {
        DreamGetResponse dreamGetResponse = dreamService.getDream(dreamId);
        if (dreamGetResponse == null) {
            return ApiResponse.error("Dream not found");
        } else {
            return ApiResponse.success(dreamGetResponse, "Dream get successfully");
        }
    }

    // 꿈 수정
    @PutMapping(value = "/{dreamId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> update(@PathVariable Integer dreamId, @RequestBody DreamUpdateRequest request) {
        DreamDto updatedDream = dreamService.update(dreamId, request);
        if (updatedDream == null) {
            return ApiResponse.error("Dream not found");
        } else {
            return ApiResponse.success(updatedDream, "Dream updated successfully");
        }
    }

    //꿈 삭제
    @DeleteMapping("/{dreamId}")
    public ApiResponse<?> delete(@PathVariable Integer dreamId) {
        boolean isDelete = dreamService.deleteDream(dreamId);
        if (isDelete) {
            return ApiResponse.success(null, "Dream deleted successfully");
        }else{
            return ApiResponse.error("Dream not found");
        }
    }

    //꿈 임시 저장
    @PostMapping(value = "/temporary" , produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> temporaryDream(@RequestBody DreamCreateRequest dreamCreateRequest) {
        DreamDto temporaryDream = dreamService.createTemporaryDream(dreamCreateRequest);
        if (temporaryDream == null) {
            return ApiResponse.error("Dream creation failed");
        }else{
            return ApiResponse.success(temporaryDream, "Dream created successfully");
        }
    }
}

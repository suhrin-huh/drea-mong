package com.ssafy.dreamong.domain.entity.dream.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamCreateRequest;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamGetResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamMainResponse;
import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/dream")
@RequiredArgsConstructor
public class DreamController {

    private final DreamService dreamService;

    @GetMapping("/{userId}")
    public ApiResponse<?> findAll(@PathVariable Integer userId) {
        List<DreamMainResponse> dreamMainResponseList = dreamService.getDreamsByUserId(userId);
        if (dreamMainResponseList.isEmpty()) {
            return ApiResponse.error("DreamList is empty");
        } else {
            return ApiResponse.success(dreamMainResponseList, "Dreams retrieved successfully");
        }
    }

    @PostMapping("/create")
    public ApiResponse<?> createDream(@RequestBody DreamCreateRequest dreamCreateRequest) {
        Dream createdDream = dreamService.create(dreamCreateRequest);
        if (createdDream == null) {
            return ApiResponse.error("Dream creation failed");
        } else {
            return ApiResponse.success(createdDream, "Dream created successfully");
        }
    }

    @GetMapping("/{dreamId}")
    public ApiResponse<?> getDream(@PathVariable Integer dreamId) {
        DreamGetResponse dreamGetResponse = dreamService.getDream(dreamId);
        if (dreamGetResponse == null) {
            return ApiResponse.error("Dream not found");
        } else {
            return ApiResponse.success(dreamGetResponse, "Dream get successfully");
        }
    }
}

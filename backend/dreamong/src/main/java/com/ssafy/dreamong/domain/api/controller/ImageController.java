package com.ssafy.dreamong.domain.api.controller;

import com.ssafy.dreamong.domain.api.service.ImageService;
import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;
    private final ChatModel chatModel;

    @PostMapping("/generate-image")
    public ResponseEntity<ApiResponse<?>> generateImage(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            List<String> images = imageService.generateImage(prompt);
            return ResponseEntity.ok(ApiResponse.success(images));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error());
        }
    }

    @PostMapping("/generate-interpretation")
    public ResponseEntity<ApiResponse<?>> generateInterpretation(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String result = imageService.generateInterpretation(message);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

package com.ssafy.dreamong.domain.api.controller;

import com.ssafy.dreamong.domain.api.service.ImageService;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/generate-image")
    public ResponseEntity<List<String>> generateImage(@RequestBody Map<String, String> request) throws IOException {
        String prompt = request.get("prompt");
        List<String> images = imageService.generateImage(prompt);
        return ResponseEntity.ok(images);
    }

    @PostMapping("/generate-interpretation")
    public ResponseEntity<String> generateInterpretation(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String interpretation = imageService.generateInterpretation(message);
        return ResponseEntity.ok(interpretation);
    }
}

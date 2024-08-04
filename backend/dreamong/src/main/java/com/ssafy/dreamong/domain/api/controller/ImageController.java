package com.ssafy.dreamong.domain.api.controller;

import com.ssafy.dreamong.domain.api.service.NovitaAiService;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ImageController {

    private final NovitaAiService novitaAiService;

    private final ChatModel chatModel;

    public ImageController(NovitaAiService novitaAiService, ChatModel chatModel) {
        this.novitaAiService = novitaAiService;
        this.chatModel = chatModel;
    }

    @PostMapping("/generate-image")
    public List<String> generateImage(@RequestBody Map<String, String> request) throws IOException {
        String prompt = request.get("prompt");
        return novitaAiService.generateImages(chatModel.call(changePrompt(prompt)));
    }

    @PostMapping("/generate-interpretation")
    public String generateInterpretation(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String prompt = createInterpretationPrompt(message);
        return chatModel.call(prompt);
    }

    private String changePrompt(String message) {
        // 프롬프트 작성 로직
        String prompt = "다음은 사용자가 꾼 꿈의 내용입니다: \"" + message + "\". " +
                "이 꿈을 영어로 번역해 주세요";
        return prompt;
    }

    private String createInterpretationPrompt(String message) {
        // 프롬프트 작성 로직
        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈을 명확하고 자세하게 해석해주세요. 꿈의 주요 상징과 의미, " +
                "꿈에서 나타난 주요 요소들의 분석, 꿈을 꾼 사람의 현재 상황이나 감정 상태와의 연관성, " +
                "꿈에서 나타난 이미지, 사람들, 장소들의 구체적인 의미, " +
                "그리고 꿈의 전체적인 해석과 조언을 포함하여 해석해주시기 바랍니다. " +
                "상세하고 체계적인 해석을 부탁드립니다.";
        return prompt;
    }
}

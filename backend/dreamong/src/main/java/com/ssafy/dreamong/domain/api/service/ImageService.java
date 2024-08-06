package com.ssafy.dreamong.domain.api.service;

import com.ssafy.dreamong.domain.api.dto.TranslationRequest;
import com.ssafy.dreamong.domain.api.dto.TranslationResponse;
import com.ssafy.dreamong.domain.config.DeepLConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final NovitaAiService novitaAiService;
    private final ChatModel chatModel;
    private final DeepLConfig deepLConfig;

    public List<String> generateImage(String prompt) throws IOException {
        String translatedPrompt = translateText(prompt);
        return novitaAiService.generateImages(chatModel.call(translatedPrompt));
    }

    public String generateInterpretation(String message) {
        String prompt = createInterpretationPrompt(message);
        return chatModel.call(prompt);
    }

    public String translateText(String text) {
        TranslationRequest request = new TranslationRequest(Collections.singletonList(text), "EN");
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Authorization", "DeepL-Auth-Key " + deepLConfig.getDeeplApiKey());

        HttpEntity<TranslationRequest> entity = new HttpEntity<>(request, headers);

        try {
            TranslationResponse response = restTemplate.postForObject(deepLConfig.getDeeplApiUrl(), entity, TranslationResponse.class);

            if (response != null && !response.getTranslations().isEmpty()) {
                return response.getTranslations().get(0).getText();
            }

            return "Translation failed: No response from DeepL";
        } catch (HttpClientErrorException e) {
            System.err.println("HTTP Status Code: " + e.getStatusCode());
            System.err.println("Response Body: " + e.getResponseBodyAsString());
            e.printStackTrace();
            return "Translation failed: " + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            return "Translation failed: " + e.getMessage();
        }
    }

    private String createInterpretationPrompt(String message) {
        return "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈을 명확하고 자세하게 해석해주세요. 꿈의 주요 상징과 의미, " +
                "꿈에서 나타난 주요 요소들의 분석, 꿈을 꾼 사람의 현재 상황이나 감정 상태와의 연관성, " +
                "꿈에서 나타난 이미지, 사람들, 장소들의 구체적인 의미, " +
                "그리고 꿈의 전체적인 해석과 조언을 포함하여 해석해주시기 바랍니다. " +
                "상세하고 체계적인 해석을 부탁드립니다.";
    }
}

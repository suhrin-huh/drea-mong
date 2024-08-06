package com.ssafy.dreamong.domain.api.service;

import com.ssafy.dreamong.domain.api.dto.TranslationRequest;
import com.ssafy.dreamong.domain.api.dto.TranslationResponse;
import com.ssafy.dreamong.domain.aws.S3UploadService;
import com.ssafy.dreamong.domain.config.DeepLConfig;
import lombok.RequiredArgsConstructor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final NovitaAiService novitaAiService;
    private final ChatModel chatModel;
    private final DeepLConfig deepLConfig;
    private final S3UploadService s3UploadService;

    @Value("${clova.api.url}")
    private String clovaApiUrl;

    @Value("${clova.api.secret}")
    private String clovaApiSecret;

    private final OkHttpClient client = new OkHttpClient();

    public List<String> generateImage(String prompt) throws IOException {
        // 프롬프트 번역
        String translatedPrompt = translateText(prompt);

        // 이미지 생성
        List<String> imageUrls = novitaAiService.generateImages(translatedPrompt);

        // 이미지 검열
        return censorImages(imageUrls);
    }

    private List<String> censorImages(List<String> imageUrls) throws IOException {
        List<String> censoredImageUrls = new ArrayList<>();

        for (String imageUrl : imageUrls) {
            JSONObject jsonRequest = new JSONObject();
            jsonRequest.put("version", "V1");
            jsonRequest.put("requestId", "requestId");
            jsonRequest.put("timestamp", System.currentTimeMillis());

            JSONArray imagesArray = new JSONArray();
            JSONObject imageObject = new JSONObject();
            imageObject.put("name", "demo");
            imageObject.put("url", imageUrl);
            imagesArray.put(imageObject);

            jsonRequest.put("images", imagesArray);

            RequestBody body = RequestBody.create(
                    jsonRequest.toString(),
                    okhttp3.MediaType.parse("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                    .url(clovaApiUrl)
                    .addHeader("X-GREEN-EYE-SECRET", clovaApiSecret)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                }

                String responseBody = response.body().string();
                // 응답을 로깅합니다.
                System.out.println("CLOVA GreenEye API 응답: " + responseBody);

                JSONObject responseJson = new JSONObject(responseBody);
                JSONArray responseImages = responseJson.getJSONArray("images");

                for (int i = 0; i < responseImages.length(); i++) {
                    JSONObject responseImage = responseImages.getJSONObject(i);
                    String message = responseImage.getString("message");
                    if ("SUCCESS".equals(message)) {
                        JSONObject result = responseImage.getJSONObject("result");
                        double adultConfidence = result.getJSONObject("adult").getDouble("confidence");
                        double normalConfidence = result.getJSONObject("normal").getDouble("confidence");
                        double pornConfidence = result.getJSONObject("porn").getDouble("confidence");
                        double sexyConfidence = result.getJSONObject("sexy").getDouble("confidence");

                        // 특정 임계값을 초과하는 이미지를 필터링하는 로직
                        if (adultConfidence < 0.5 && pornConfidence < 0.5 && sexyConfidence < 0.5) {
                            censoredImageUrls.add(imageUrl);
                        }
                    }
                }
            }
        }
        return censoredImageUrls;
    }

    public String generateInterpretation(String message) {
        String prompt = createInterpretationPrompt(message);
        return chatModel.call(prompt);
    }

    public String translateText(String text) {
        TranslationRequest request = new TranslationRequest(Collections.singletonList(text), "EN");
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(org.springframework.http.MediaType.APPLICATION_JSON));
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
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

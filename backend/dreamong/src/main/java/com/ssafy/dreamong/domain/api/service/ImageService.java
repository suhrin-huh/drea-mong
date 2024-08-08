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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
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
        //프롬프트 수정
        String upDatePrompt = createDreamImagePrompt(prompt);
        System.out.println(upDatePrompt);

        // 프롬프트 번역
        String translatedPrompt = translateText(upDatePrompt);
        System.out.println(translatedPrompt);

        // 이미지 생성
        List<String> imageUrls = novitaAiService.generateImages(translatedPrompt);

        // 이미지 검열 및 S3 업로드
        return censorAndUploadImages(imageUrls);
    }

    private List<String> censorAndUploadImages(List<String> imageUrls) throws IOException {
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
                            // 이미지 다운로드
                            byte[] imageBytes = downloadImage(imageUrl);
                            // S3에 이미지 업로드
                            String s3Url = s3UploadService.uploadImageToS3(imageBytes, "image_" + System.currentTimeMillis() + ".png");
                            censoredImageUrls.add(s3Url);
                        }
                    }
                }
            }
        }
        return censoredImageUrls;
    }

    private byte[] downloadImage(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        try (InputStream in = url.openStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int n;
            while ((n = in.read(buffer)) != -1) {
                out.write(buffer, 0, n);
            }
            return out.toByteArray();
        }
    }

    public String generateInterpretation(String prompt) {
        String message = createDreamInterpretationPrompt(prompt);
        try {
            String result = chatModel.call(message);
            return result.replaceAll("\\n\\n", " ").replaceAll("\\n", " ");
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return "API 키가 만료되었거나 권한이 없습니다.";
            }
            throw e;
        } catch (ResourceAccessException e) {
            return "네트워크 문제로 요청을 처리할 수 없습니다.";
        } catch (Exception e) {
            return "예기치 않은 오류가 발생했습니다.";
        }
    }

    public String translateText(String text) {
        // 1단계: 일본어로 번역
//        String japaneseText = translateToLanguage(text, "CS");

        // 2단계: 일본어 텍스트를 영어로 번역
//        return translateToLanguage(japaneseText, "EN");
        return translateToLanguage(text, "EN");
    }

    public String translateToLanguage(String text, String targetLanguage) {
        TranslationRequest request = new TranslationRequest(Collections.singletonList(text), targetLanguage);
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
            e.printStackTrace();
            return "Translation failed: " + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            return "Translation failed: " + e.getMessage();
        }
    }

    private String createDreamInterpretationPrompt(String message) {
        return "사용자가 제공한 꿈의 내용은 다음과 같습니다:\n\"" + message + "\"\n\n" +
                "이 꿈 내용을 바탕으로 해몽 결과를 작성해 주세요.\n" +
                "해몽 결과는 한 문단으로 작성해 주세요.\n" +
                "선정적이거나 폭력적, 혐오적인 단어는 피해주세요.";
    }

    private String createDreamImagePrompt(String message) {
        return chatModel.call("당신은 세계 최고의 글 편집가입니다. 사용자가 제공한 꿈의 내용은 다음과 같습니다:\n\"" + message + "\"\n\n" +
                "이 꿈 내용을 다음의 조건에 따라 수정해 주세요:\n" +
                "1. 선정적이거나 폭력적, 혐오적인 단어를 제거해 주세요.\n" +
                "2. 특정 인물(예: 이름, 가족, 친구 등)에 관한 언급을 제거해 주세요.\n" +
                "3. 꿈의 내용과 어울리는 배경의 느낌을 강조해 주세요.\n" +
                "4. 사물(예: 동물)은 그대로 유지해 주세요.\n\n" +
                "이 조건을 모두 지키며 꿈 내용을 수정해 주세요. " +
                "이 조건을 못 지킨다면 불이익을 얻을 수 있습니다." +
                "수정된 꿈 내용만 제공해 주세요.");
    }

}

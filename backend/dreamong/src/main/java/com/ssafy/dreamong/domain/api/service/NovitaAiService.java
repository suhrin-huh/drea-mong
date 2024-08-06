package com.ssafy.dreamong.domain.api.service;

import com.ssafy.dreamong.domain.aws.S3UploadService;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class NovitaAiService {

    @Value("${novita.api.key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final S3UploadService s3UploadService;

    public NovitaAiService(S3UploadService s3UploadService) {
        this.s3UploadService = s3UploadService;
    }

    public List<String> generateImages(String prompt) throws IOException {
        String url = "https://api.novita.ai/v3/lcm-txt2img";

        // 요청 JSON 데이터 생성
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("model_name", "dreamshaper_8_93211.safetensors");
        jsonObject.put("prompt", prompt);
        jsonObject.put("negative_prompt", "");
        jsonObject.put("height", 1024);
        jsonObject.put("width", 1024);
        jsonObject.put("image_num", 4);  // 4개의 이미지를 요청하도록 변경
        jsonObject.put("steps", 8);
        jsonObject.put("seed", -1);
        jsonObject.put("guidance_scale", 2);
        jsonObject.put("clip_skip", 1);

        // 요청 본문 설정
        RequestBody body = RequestBody.create(
                jsonObject.toString(),
                MediaType.get("application/json; charset=utf-8")
        );

        // 요청 빌드
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            String responseBody = response.body().string();
            JSONObject responseJson = new JSONObject(responseBody);

            JSONArray imagesArray = responseJson.optJSONArray("images");

            List<String> imageUrls = new ArrayList<>();
            int count = 0;

            if (imagesArray != null) {
                for (int i = 0; i < imagesArray.length() && count < 4; i++) {
                    JSONObject imageObject = imagesArray.getJSONObject(i);
                    String imageFile = imageObject.optString("image_file");
                    if (!imageFile.isEmpty()) {
                        byte[] imageBytes = Base64.getDecoder().decode(imageFile);
                        String imageUrl = s3UploadService.uploadImageToS3(imageBytes, "image_" + count + ".png");
                        imageUrls.add(imageUrl);
                        count++;
                    }
                }
            }

            return imageUrls;
        }
    }
}

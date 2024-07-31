package com.ssafy.dreamong.domain.api.service;

import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class NovitaAiService {

    @Value("${novita.api.key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();

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

        // 요청 데이터 로깅
//        System.out.println("Request: " + jsonObject.toString());
        //Request: {"model_name":"dreamshaper_8_93211.safetensors","seed":-1,"negative_prompt":"","guidance_scale":2,"width":1024,"prompt":"a beautiful forest with mystical creatures","steps":8,"clip_skip":1,"height":1024,"image_num":4}

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.err.println("API Error: " + response.code() + " " + response.message());
                throw new IOException("Unexpected code " + response);
            }

            // 응답 본문 추출 및 로깅
            String responseBody = response.body().string(); //API 응답 데이터를 문자열로 추출합니다. (Base64인코딩 된 문자열로 받고 있음)

//            System.out.println("API Response: " + responseBody);

            /*
                1. imagesArray는 responseJson.optJSONArray("images")로 얻어지며, 각 이미지의 image_file 필드를 추출합니다.
                2. imageArray는 responseJson.optJSONArray("image")로 얻어지며, 각 이미지의 image_url 필드를 추출합니다.
                이 과정에서 추출된 이미지 데이터는 List<String> imageUrls 리스트에 저장되며, 이 리스트가 메서드의 반환값으로 사용됩니다.
                {
                        "images": [
                                    {
                                    "image_url": "",
                                    "image expire time": null,
                                    "image_type": ""
                                    }
                                  ],
                        "image": [
                                    {
                                        "image_url": "{{image url}}",
                                        "image_url_ttl": "3600",
                                        "image_type": "jpeg"
                                    },
                                    {
                                        "image_url": "{{image url}}",
                                        "image_url_ttl": "3600",
                                        "image_type": "jpeg"
                                    }
                                 ]
                  }
             */

            // 응답 JSON 데이터 파싱
            JSONObject responseJson = new JSONObject(responseBody); //JSON 객체로 변환합니다.

            // 'images' 배열과 'image' 배열 모두 처리
            JSONArray imagesArray = responseJson.optJSONArray("images"); //이미지 데이터 추출
            JSONArray imageArray = responseJson.optJSONArray("image"); //이미지 데이터 추출

            List<String> imageUrls = new ArrayList<>();
            int count = 0;

            // 'images' 배열에서 'image_file' 필드 추출 (최대 4장)
            if (imagesArray != null) {
                for (int i = 0; i < imagesArray.length() && count < 4; i++) {
                    JSONObject imageObject = imagesArray.getJSONObject(i);
                    String imageFile = imageObject.optString("image_file");
                    if (!imageFile.isEmpty()) {
                        imageUrls.add(imageFile);
                        count++;
                    }
                }
            }

            // 'image' 배열에서 'image_url' 필드 추출 (최대 4장)
            if (imageArray != null) {
                for (int i = 0; i < imageArray.length() && count < 4; i++) {
                    JSONObject imageObject = imageArray.getJSONObject(i);
                    String imageUrl = imageObject.optString("image_url");
                    if (!imageUrl.isEmpty()) {
                        imageUrls.add(imageUrl);
                        count++;
                    }
                }
            }

            return imageUrls;
        }
    }
}

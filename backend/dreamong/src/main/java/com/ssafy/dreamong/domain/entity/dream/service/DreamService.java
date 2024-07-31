package com.ssafy.dreamong.domain.entity.dream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamCreateRequest;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamGetResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamMainResponse;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DreamService {

    private final DreamRepository dreamRepository;

    private final ChatModel chatModel;

    private final ObjectMapper objectMapper; // Jackson ObjectMapper를 사용하여 JSON 파싱

    //등록
    @Transactional
    public Dream create(DreamCreateRequest dreamCreateRequest) {
        //한줄 요약
        String summary = SingleLineInterpretation(dreamCreateRequest.getSummary());

        //꿈 카테고리 분석 및 단어 추출
        String detailedPrompt = DetailedPrompt(dreamCreateRequest.getContent());
        String analysisResultJson = chatModel.call(detailedPrompt);

        List<DreamCategory> dreamCategories = parseDreamCategories(analysisResultJson);

        Dream dream = Dream.builder()
                .content(dreamCreateRequest.getContent())
                .image(dreamCreateRequest.getImage())
                .interpretation(dreamCreateRequest.getInterpretation())
                .summary(summary)
                .isShared(false)
                .likesCount(0)
                .writeTime(dreamCreateRequest.getWriteTime())
                .userId(dreamCreateRequest.getUserId())
                .dreamCategories(dreamCategories)
                .build();

        return dreamRepository.save(dream);
    }

    //상세보기
    public DreamGetResponse getDream(Integer dreamId) {
        Dream dream = dreamRepository.findById(dreamId).orElse(null);

        if (dream != null) {
            return new DreamGetResponse(
                    dream.getContent(),
                    dream.getImage(),
                    dream.getInterpretation(),
                    dream.getSummary(),
                    dream.isShared(),
                    dream.getLikesCount(),
                    dream.getWriteTime()
            );
        } else {
            return null;
        }
    }

    // 메인 조회
    public List<DreamMainResponse> getDreamsByUserId(Integer userId) {
        List<Dream> dreams = dreamRepository.findAllByUserIdOrderByWriteTimeDesc(userId);
        List<DreamMainResponse> dreamMainResponseList = new ArrayList<>();
        for (Dream dream : dreams) {
            DreamMainResponse response = new DreamMainResponse(
                    dream.getContent(),
                    dream.getImage(),
                    dream.getWriteTime()
            );
            dreamMainResponseList.add(response);
        }
        return dreamMainResponseList;
    }


    private String SingleLineInterpretation(String message) {
        // 프롬프트 작성 로직
        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈을 한 줄로 간단하게 해석해주세요.";
        return chatModel.call(prompt);
    }

    private String DetailedPrompt(String message) {
        // 프롬프트 작성 로직
        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈을 다음의 카테고리로 분류하고 각 카테고리별로 주요 단어를 JSON 형식으로 추출해주세요:\n" +
                "1. 꿈 종류 (dreamType): 이 꿈의 종류는 무엇입니까? (예: 악몽, 행복한 꿈, 예지몽 등)\n" +
                "2. 인물 (character): 꿈에 등장한 주요 인물은 누구입니까?\n" +
                "3. 기분 (mood): 이 꿈을 꿀 때 느낀 기분은 어떠했습니까? (예: 두려움, 기쁨, 슬픔 등)\n" +
                "4. 장소 (location): 꿈에서 나타난 주요 장소는 어디입니까?\n" +
                "5. 사물 또는 동물 (objects): 꿈에 등장한 주요 사물이나 동물은 무엇입니까? 이 정보는 해시태그(#) 형식으로 제공해주세요.\n" +
                "응답은 JSON 형식으로 해주세요.";
        return prompt;
    }

    private List<DreamCategory> parseDreamCategories(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            List<DreamCategory> categories = new ArrayList<>();

            if (root.has("dreamType")) {
                Category category = new Category(root.get("dreamType").asText(), Type.dreamType);
                categories.add(new DreamCategory(null, category));
            }
            if (root.has("character")) {
                Category category = new Category(root.get("character").asText(), Type.character);
                categories.add(new DreamCategory(null, category));
            }
            if (root.has("mood")) {
                Category category = new Category(root.get("mood").asText(), Type.mood);
                categories.add(new DreamCategory(null, category));
            }
            if (root.has("location")) {
                Category category = new Category(root.get("location").asText(), Type.location);
                categories.add(new DreamCategory(null, category));
            }
            if (root.has("objects")) {
                Category category = new Category(root.get("objects").asText(), Type.objects);
                categories.add(new DreamCategory(null, category));
            }

            return categories;
        } catch (Exception e) {
            log.error("Error parsing dream categories JSON", e);
            return new ArrayList<>();
        }
    }
}

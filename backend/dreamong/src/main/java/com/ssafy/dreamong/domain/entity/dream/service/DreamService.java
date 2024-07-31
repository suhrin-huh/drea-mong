package com.ssafy.dreamong.domain.entity.dream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamCreateRequest;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamGetResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamMainResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.DreamUpdateRequest;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    public List<DreamMainResponse> getDreamsByUserIdAndWriteTime(Integer userId, String writeTime) {
        // 날짜를 파싱하여 연도와 월을 추출합니다.
        LocalDate date = LocalDate.parse(writeTime, DateTimeFormatter.ofPattern("yyyyMMdd"));
        String yearMonth = date.format(DateTimeFormatter.ofPattern("yyyyMM"));

        List<Dream> dreams = dreamRepository.findAllByUserIdAndWriteTimeLikeOrderByWriteTimeDesc(userId, yearMonth);
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

    //수정
    @Transactional
    public Dream update(Integer dreamId, DreamUpdateRequest dreamUpdateRequest) {
        Dream existingDream = dreamRepository.findById(dreamId).orElse(null);

        if (existingDream == null) {
            return null; // 존재하지 않는 꿈 ID일 경우 null 반환
        }

        // 새로 업데이트된 정보로 Dream 객체 생성
        String newSummary = SingleLineInterpretation(dreamUpdateRequest.getSummary());
        String detailedPrompt = DetailedPrompt(dreamUpdateRequest.getContent());
        String analysisResultJson = chatModel.call(detailedPrompt);

        List<DreamCategory> newDreamCategories = parseDreamCategories(analysisResultJson);

        // 기존 Dream 객체의 ID, isShared, likesCount, userId를 유지하며 새로 업데이트
        existingDream.updateDreamCategories(newDreamCategories); // 카테고리 리스트 업데이트

        // 엔티티의 나머지 필드를 업데이트
        Dream updatedDream = Dream.builder()
                .id(existingDream.getId()) // 기존 ID 유지
                .content(dreamUpdateRequest.getContent())
                .image(dreamUpdateRequest.getImage())
                .interpretation(dreamUpdateRequest.getInterpretation())
                .summary(newSummary)
                .isShared(existingDream.isShared()) // 공유 여부는 그대로 유지
                .likesCount(existingDream.getLikesCount()) // 좋아요 수는 그대로 유지
                .writeTime(dreamUpdateRequest.getWriteTime())
                .userId(existingDream.getUserId()) // 사용자 ID는 기존과 동일
                .dreamCategories(existingDream.getDreamCategories()) // 카테고리 업데이트
                .build();

        return dreamRepository.save(updatedDream);
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

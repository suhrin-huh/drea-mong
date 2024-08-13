package com.ssafy.dreamong.domain.entity.dream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.category.repository.CategoryRepository;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.*;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import com.ssafy.dreamong.domain.entity.dreamcategory.repository.DreamCategoryRepository;
import com.ssafy.dreamong.domain.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DreamService {

    private final DreamRepository dreamRepository;
    private final CategoryRepository categoryRepository;
    private final ChatModel chatModel;
    private final DreamCategoryRepository dreamCategoryRepository;
    private final ObjectMapper objectMapper; // Jackson ObjectMapper를 사용하여 JSON 파싱

    // 꿈 생성
    @Transactional
    public DreamDto create(DreamCreateRequest dreamRequest) {
        String newSummary = SingleLineInterpretation(dreamRequest.getContent());

        String detailedPrompt = DetailedPrompt(dreamRequest.getContent());
        String analysisResultJson = chatModel.call(detailedPrompt);
        Set<DreamCategoryDto> dreamCategoryDtoSet = new HashSet<>(parseDreamCategories(analysisResultJson));

        // Dream 객체 생성
        Dream dream = Dream.builder()
                .content(dreamRequest.getContent())
                .image(dreamRequest.getImage())
                .interpretation(dreamRequest.getInterpretation())
                .summary(newSummary)
                .isShared(dreamRequest.isShared())
                .userId(dreamRequest.getUserId())
                .writeTime(dreamRequest.getWriteTime())
                .build();

        // Dream 객체를 먼저 저장하여 ID를 생성
        dream = dreamRepository.save(dream);

        // 새로운 카테고리 추가
        Set<DreamCategory> newDreamCategories = new HashSet<>();
        for (DreamCategoryDto dto : dreamCategoryDtoSet) {
            Category category = categoryRepository.findByWordAndType(dto.getCategoryWord(), Type.valueOf(dto.getCategoryType()))
                    .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryWord(), Type.valueOf(dto.getCategoryType()))));

            // 중복 체크를 통해 DreamCategory가 이미 존재하는지 확인
            boolean exists = dreamCategoryRepository.existsByDreamAndCategory(dream, category);

            if (!exists) {
                DreamCategory dreamCategory = DreamCategory.builder()
                        .dream(dream)
                        .category(category)
                        .build();
                newDreamCategories.add(dreamCategory);
            }
        }

        // 새로운 DreamCategory를 Dream에 추가
        dream.getDreamCategories().addAll(newDreamCategories);

        // Dream 객체를 다시 저장
        return toDreamDto(dreamRepository.save(dream));
    }

    // 상세보기
    public DreamGetResponse getDream(Integer dreamId) {
        Dream dream = dreamRepository.findById(dreamId).orElseThrow(() -> new NotFoundException("Dream not found"));

        return new DreamGetResponse(
                dream.getContent(),
                dream.getImage(),
                dream.getInterpretation(),
                dream.getSummary(),
                dream.isShared(),
                dream.getWriteTime()
        );
    }

    // 메인 조회
    public DreamMainResponseWithCount getDreamsByUserIdAndWriteTime(Integer userId, String writeTime) {
        LocalDate date = LocalDate.parse(writeTime, DateTimeFormatter.ofPattern("yyyyMMdd"));
        String yearMonth = date.format(DateTimeFormatter.ofPattern("yyyyMM"));

        List<Dream> dreams = dreamRepository.findAllByUserIdAndWriteTimeLikeOrderByWriteTimeDesc(userId, yearMonth);

        List<DreamMainResponse> dreamMainResponseList = dreams.stream()
                .map(dream -> new DreamMainResponse(dream.getId(), dream.getContent(), dream.getImage(), dream.getWriteTime()))
                .collect(Collectors.toList());

        long totalCount = dreamRepository.countByUserId(userId);

        return new DreamMainResponseWithCount(dreamMainResponseList, totalCount);
    }

    // 꿈 수정
    @Transactional
    public DreamDto update(Integer dreamId, DreamUpdateRequest dreamUpdateRequest) {
        Dream existingDream = dreamRepository.findById(dreamId).orElseThrow(() -> new NotFoundException("Dream not found"));

        // AI API 호출하여 summary 생성
        String newSummary = SingleLineInterpretation(dreamUpdateRequest.getContent());

        // AI API 호출하여 category 분석
        String detailedPrompt = DetailedPrompt(dreamUpdateRequest.getContent());
        String analysisResultJson = chatModel.call(detailedPrompt);

        // Set으로 중복 제거
        Set<DreamCategoryDto> dreamCategoryDtos = new HashSet<>(parseDreamCategories(analysisResultJson));

        // 기존 카테고리 삭제
        existingDream.getDreamCategories().clear();
        dreamRepository.save(existingDream); // 기존의 연관관계를 명시적으로 저장

        // 새로운 카테고리 추가
        Set<DreamCategory> newDreamCategories = new HashSet<>();
        for (DreamCategoryDto dto : dreamCategoryDtos) {
            Category category = categoryRepository.findByWordAndType(dto.getCategoryWord(), Type.valueOf(dto.getCategoryType()))
                    .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryWord(), Type.valueOf(dto.getCategoryType()))));

            // 중복 체크를 통해 DreamCategory가 이미 존재하는지 확인
            boolean exists = dreamCategoryRepository.existsByDreamAndCategory(existingDream, category);

            if (!exists) {
                DreamCategory dreamCategory = DreamCategory.builder()
                        .dream(existingDream)
                        .category(category)
                        .build();
                newDreamCategories.add(dreamCategory);
            }
        }

        // 새로운 DreamCategory를 기존 Dream에 추가
        existingDream.getDreamCategories().addAll(newDreamCategories);

        // Dream 객체 업데이트
        existingDream.update(
                dreamUpdateRequest.getContent(),
                dreamUpdateRequest.getImage(),
                dreamUpdateRequest.getInterpretation(),
                newSummary, // 새로운 summary 사용
                dreamUpdateRequest.getWriteTime(),
                dreamUpdateRequest.isShared(),
                newDreamCategories
        );

        return toDreamDto(dreamRepository.save(existingDream));
    }


    // 꿈 삭제
    @Transactional
    public boolean deleteDream(Integer dreamId) {
        Dream dream = dreamRepository.findById(dreamId).orElseThrow(() -> new NotFoundException("Dream not found"));
        dreamRepository.delete(dream);
        return true;
    }

    // 꿈 임시저장
    @Transactional
    public DreamDto createTemporaryDream(DreamCreateRequest dreamCreateRequest) {
        Dream dream = Dream.builder()
                .content(dreamCreateRequest.getContent())
                .image(dreamCreateRequest.getImage())
                .interpretation(dreamCreateRequest.getInterpretation())
                .summary("")
                .isShared(dreamCreateRequest.isShared())
                .userId(dreamCreateRequest.getUserId())
                .writeTime(dreamCreateRequest.getWriteTime())
                .dreamCategories(new HashSet<>()) // HashSet으로 중복 방지
                .build();

        dream = dreamRepository.save(dream);
        return toDreamDto(dream);
    }

    // 한줄 요약
    private String SingleLineInterpretation(String message) {
        // 프롬프트 작성 로직
        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈의 주요 상징과 의미를 한 줄로 간단하게 요약해주세요. " +
                "대답은 (예: 입력내용을 기반으로 꾸미는 말 없이 요약해서 '~~하는 꿈'으로 응답해줘)";
        return chatModel.call(prompt);
    }

    // 카테고리 뽑기
    private String DetailedPrompt(String message) {
        // 프롬프트 작성 로직
        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
                "이 꿈을 아래의 다섯 개 카테고리로 분류해주세요. **모든** 카테고리에서 반드시 **최소 하나** 이상의 항목을 선택하여야 하며, 각 항목이 적절하게 선택되어야 합니다. " +
                "모든 카테고리에서 항목이 누락되거나 부적절하게 선택된 경우, 불이익이 있을 수 있습니다. " +
                "결과는 반드시 JSON 형식으로 출력해주세요:\n" +
                "1. 꿈 종류 (dreamType): 이 꿈의 종류는 무엇입니까? (예: 일반 / 루시드드림 / 악몽 / 반복적 꿈 / 예지몽 / 생생한 꿈) 예시에 있는 종류로만 구분해주세요. (루시드드림 / 악몽 / 반복적 꿈 / 예지몽 / 생생한 꿈) 여기에 해당하지 않는 꿈은 일반으로 해주세요.\n" +
                "2. 인물 (character): 꿈에 등장한 인물은 누구입니까? 인물의 역할과 관계를 (예: 가족, 친구, 낯선 사람 등) 포함해주세요. 반대로 나, 자신, 사용자 등 자신을 포함하는 단어는 제외해주세요.\n" +
                "3. 기분 (mood): 이 꿈을 꿀 때 느낀 기분은 어떠했습니까? (예: 두려움, 기쁨, 슬픔 등)\n" +
                "4. 장소 (location): 꿈에서 장소들은 어디입니까? 가능한 자세하게 설명해주세요. (예: 집, 학교, 공원 등)\n" +
                "5. 사물 또는 동물 (objects): 꿈에 등장한 주요 사물이나 동물은 무엇입니까? 가능한 구체적으로 설명해주세요. (예: 자동차, 고양이, 책 등)\n" +
                "모든 카테고리에서 최소 하나 이상의 항목이 포함된 JSON 형식으로 응답해주세요.";
        return prompt;
    }

    // 카테고리별 파싱
    private Set<DreamCategoryDto> parseDreamCategories(String json) {
        try {
            json = json.trim();
            json = json.replace("```json", "").replace("```", "").replace("`", "").trim();

            JsonNode root = objectMapper.readTree(json);

            Set<DreamCategoryDto> categories = new HashSet<>(); // 중복 제거를 위해 Set 사용

            if (root.has("dreamType")) {
                String dreamType = root.get("dreamType").asText();
                if (!dreamType.isEmpty()) {
                    categories.add(new DreamCategoryDto(null, dreamType, "dreamType"));
                }
            }
            if (root.has("character")) {
                JsonNode characters = root.get("character");
                if (characters.isArray()) {
                    for (JsonNode characterNode : characters) {
                        String character = characterNode.asText();
                        if (!character.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, character, "character"));
                        }
                    }
                } else if (characters.isObject()) {
                    characters.fields().forEachRemaining(field -> {
                        String character = field.getValue().asText();
                        if (!character.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, character, "character"));
                        }
                    });
                }
            }
            if (root.has("mood")) {
                JsonNode moods = root.get("mood");
                if (moods.isArray()) {
                    for (JsonNode moodNode : moods) {
                        String mood = moodNode.asText();
                        if (!mood.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, mood, "mood"));
                        }
                    }
                } else if (moods.isObject()) {
                    moods.fields().forEachRemaining(field -> {
                        String mood = field.getValue().asText();
                        if (!mood.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, mood, "mood"));
                        }
                    });
                }
            }
            if (root.has("location")) {
                JsonNode locations = root.get("location");
                if (locations.isArray()) {
                    for (JsonNode locationNode : locations) {
                        String location = locationNode.asText();
                        if (!location.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, location, "location"));
                        }
                    }
                } else if (locations.isObject()) {
                    locations.fields().forEachRemaining(field -> {
                        String location = field.getValue().asText();
                        if (!location.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, location, "location"));
                        }
                    });
                }
            }
            if (root.has("objects")) {
                JsonNode objects = root.get("objects");
                if (objects.isArray()) {
                    for (JsonNode objectNode : objects) {
                        String object = objectNode.asText();
                        if (!object.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, object, "objects"));
                        }
                    }
                } else if (objects.isObject()) {
                    objects.fields().forEachRemaining(field -> {
                        String object = field.getValue().asText();
                        if (!object.isEmpty()) {
                            categories.add(new DreamCategoryDto(null, object, "objects"));
                        }
                    });
                }
            }

            return categories; // Set을 반환하여 중복을 제거함
        } catch (Exception e) {
            return new HashSet<>();
        }
    }

    // 순환 참조를 방지를 위한 메소드
    private DreamDto toDreamDto(Dream dream) {
        List<DreamCategoryDto> categoryDtos = dream.getDreamCategories().stream()
                .map(this::toDreamCategoryDto)
                .collect(Collectors.toList());
        return new DreamDto(dream.getId(), dream.getContent(), dream.getImage(), dream.getInterpretation(),
                dream.getSummary(), dream.isShared(), dream.getUserId(),
                dream.getWriteTime(), categoryDtos);
    }

    // 순환 참조를 방지를 위한 메소드
    private DreamCategoryDto toDreamCategoryDto(DreamCategory dreamCategory) {
        return new DreamCategoryDto(dreamCategory.getId(), dreamCategory.getCategory().getWord(),
                dreamCategory.getCategory().getType().name());
    }

    private boolean dreamCategoryExists(Dream dream, Category category) {
        return dream.getDreamCategories().stream()
                .anyMatch(dreamCategory -> dreamCategory.getCategory().equals(category));
    }
}


package com.ssafy.dreamong.domain.entity.category.service;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.dreamong.domain.entity.category.dto.CategoryResponseDto;
import com.ssafy.dreamong.domain.entity.category.dto.CommonResponseDto;
import com.ssafy.dreamong.domain.entity.category.dto.DreamTypeCountDto;
import com.ssafy.dreamong.domain.entity.category.dto.ObjectResponseDto;
import com.ssafy.dreamong.domain.entity.category.repository.CategoryRepository;
import com.ssafy.dreamong.domain.exception.BadRequestException;
import com.ssafy.dreamong.domain.exception.ServerErrorException;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ChatModel chatModel; // AI 모델과의 통신을 위한 ChatModel

    // 요청 데이터를 처리하여 한 달간의 카테고리별 데이터를 조회
    public CategoryResponseDto getCategoryDataByUserAndDate(Integer userId, String currentDate) {
        YearMonth yearMonth = YearMonth.parse(currentDate, DateTimeFormatter.ofPattern("yyyyMM"));
        return getCategoryDataByUserAndDate(userId, yearMonth);
    }

    // 한 달간의 카테고리별 데이터 조회
    private CategoryResponseDto getCategoryDataByUserAndDate(Integer userId, YearMonth yearMonth) {
        String startDate = yearMonth.atDay(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String endDate = yearMonth.atEndOfMonth().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 기분 데이터
        List<CommonResponseDto> moodDtos = categoryRepository.findMoodCategoriesByDateRange(startDate, endDate).stream()
                .map(category -> new CommonResponseDto(category.getWord(), category.getType()))
                .collect(Collectors.toList());

        // 인물 데이터 (빈도수 상위 3개)
        List<CommonResponseDto> characterDtos = categoryRepository.findCharacterCategoriesByDateRange(startDate, endDate).stream()
                .limit(3)
                .map(category -> new CommonResponseDto(category.getWord(), category.getType()))
                .collect(Collectors.toList());

        // 장소 데이터 (빈도수 상위 3개)
        List<CommonResponseDto> locationDtos = categoryRepository.findLocationCategoriesByDateRange(startDate, endDate).stream()
                .limit(3)
                .map(category -> new CommonResponseDto(category.getWord(), category.getType()))
                .collect(Collectors.toList());

        // 사물 데이터 (빈도수 상위 3개)
        List<ObjectResponseDto> objectDtos = categoryRepository.findObjectCategoriesByDateRange(startDate, endDate).stream()
                .limit(3)
                .map(category -> {
                    List<String> hashTags;
                    try {
                        hashTags = getHashTagsFromAI(category.getWord());
                    } catch (Exception e) {
                        throw new ServerErrorException("Failed to get hashtags from AI: " + e.getMessage());
                    }
                    return new ObjectResponseDto(category.getWord(), hashTags);
                })
                .collect(Collectors.toList());

        // 꿈 종류별 카운트 데이터
        List<DreamTypeCountDto> dreamTypeCounts = categoryRepository.countDreamTypesByDateRange(startDate, endDate).stream()
                .map(countDto -> new DreamTypeCountDto(countDto.getDreamType(), countDto.getCount()))
                .collect(Collectors.toList());

        return new CategoryResponseDto(moodDtos, characterDtos, locationDtos, objectDtos, dreamTypeCounts);
    }

    private List<String> getHashTagsFromAI(String word) {
        String prompt = generateHashTagPrompt(word);
        String analysisResultJson = chatModel.call(prompt);
        return parseHashTags(analysisResultJson);
    }

    private String generateHashTagPrompt(String word) {
        return "사용자가 꾼 꿈에 등장한 사물 또는 동물은 다음과 같습니다: \"" + word + "\". " +
                "이 단어를 기반으로 해시태그 3개를 생성해주세요. " +
                "해시태그는 욕설, 선정적 단어, 폭력적 단어, 혐오적 단어를 포함하지 않아야 합니다. \"" +
                word +
                "\" 에 해당 하는 단어는 해시태크에서 제외 해주세요" +
                "응답은 다음 형식의 JSON으로 해주세요: {\"hashtags\": [\"#태그1\", \"#태그2\", \"#태그3\"]}";
    }

    private List<String> parseHashTags(String aiResponse) {
        List<String> hashTags = new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(aiResponse);
            JsonNode hashTagsNode = root.path("hashtags");
            if (hashTagsNode.isArray()) {
                for (JsonNode tag : hashTagsNode) {
                    hashTags.add(tag.asText());
                }
            }
        } catch (JsonParseException e) {
            // JSON 파싱 예외 처리
            throw new BadRequestException("Invalid JSON format: " + aiResponse);
        } catch (Exception e) {
            // 기타 예외 처리
            throw new ServerErrorException("Failed to parse AI response: " + e.getMessage());
        }
        return hashTags;
    }
}

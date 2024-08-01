//package com.ssafy.dreamong.domain.entity.dream.controller;
//
//
//import com.ssafy.dreamong.domain.entity.category.Category;
//import com.ssafy.dreamong.domain.entity.category.Type;
//import com.ssafy.dreamong.domain.entity.category.repository.CategoryRepository;
//import com.ssafy.dreamong.domain.entity.dream.Dream;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamCreateRequest;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamGetResponse;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamMainResponse;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamUpdateRequest;
//import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
//import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
//import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.ai.chat.model.ChatModel;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Collections;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//
//@SpringBootTest
//@ActiveProfiles("test")
//@Transactional
//public class DreamServiceTest {
//
//    @Autowired
//    private DreamService dreamService;
//
//    @Autowired
//    private DreamRepository dreamRepository;
//
//    @Autowired
//    private CategoryRepository categoryRepository;
//
//    @Mock
//    private ChatModel chatModel;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//    }
//
//    @Test
//    void testCreateDream() {
//        // given
//        DreamCreateRequest request = new DreamCreateRequest("New Dream", "New Image", "New Interpretation", "New Summary", 1, "20240731", Collections.emptyList());
//
//        // when
//        Dream createdDream = dreamService.create(request);
//
//        // then
//        assertThat(createdDream).isNotNull();
//        assertThat(createdDream.getContent()).isEqualTo("New Dream");
//        assertThat(createdDream.getImage()).isEqualTo("New Image");
//        assertThat(createdDream.getInterpretation()).isEqualTo("New Interpretation");
//        assertThat(createdDream.getSummary()).isNotEqualTo("New Summary");
//        assertThat(createdDream.getUserId()).isEqualTo(1);
//        assertThat(createdDream.getWriteTime()).isEqualTo("20240731");
//
//        // 카테고리 리스트가 예상대로 생성되었는지 확인
//        List<DreamCategory> createdCategories = createdDream.getDreamCategories();
//        assertThat(createdCategories).hasSize(5); // 예상되는 카테고리 수
//        assertThat(createdCategories).extracting("category.word").containsExactlyInAnyOrder("NewCategory1", "NewCategory2", "NewCategory3", "NewCategory4", "#NewCategory5");
//
//        // 각 필드 출력
//        System.out.println("Created Dream Content: " + createdDream.getContent());
//        System.out.println("Created Dream Image: " + createdDream.getImage());
//        System.out.println("Created Dream Interpretation: " + createdDream.getInterpretation());
//        System.out.println("Created Dream Summary: " + createdDream.getSummary());
//        System.out.println("Created Dream UserId: " + createdDream.getUserId());
//        System.out.println("Created Dream WriteTime: " + createdDream.getWriteTime());
//        System.out.println("Created Dream Categories: " + createdCategories);
//    }
//
//
//    @Test
//    void testFindAllDreams() {
//        // given
//        Integer userId = 1;
//        String writeTime = "20240731";
//        Dream dream1 = dreamRepository.save(Dream.builder()
//                .content("Content1")
//                .image("Image1")
//                .interpretation("Interpretation1")
//                .summary("Summary1")
//                .isShared(true)
//                .likesCount(5)
//                .userId(userId)
//                .writeTime("20240731")
//                .dreamCategories(Collections.emptyList()) // 빈 리스트로 초기화
//                .build());
//        Dream dream2 = dreamRepository.save(Dream.builder()
//                .content("Content2")
//                .image("Image2")
//                .interpretation("Interpretation2")
//                .summary("Summary2")
//                .isShared(false)
//                .likesCount(10)
//                .userId(userId)
//                .writeTime("20240731")
//                .dreamCategories(Collections.emptyList()) // 빈 리스트로 초기화
//                .build());
//
//        // when
//        List<DreamMainResponse> retrievedDreams = dreamService.getDreamsByUserIdAndWriteTime(userId, writeTime);
//
//        // then
//        assertThat(retrievedDreams.size()).isEqualTo(2);
//        assertThat(retrievedDreams.get(0).getContent()).isEqualTo("Content1");
//        assertThat(retrievedDreams.get(1).getContent()).isEqualTo("Content2");
//    }
//
//    @Test
//    void testGetDream() {
//        // given
//        Integer dreamId = 1;
//        Dream dream = dreamRepository.save(Dream.builder()
//                .content("Content")
//                .image("Image")
//                .interpretation("Interpretation")
//                .summary("Summary")
//                .isShared(false)
//                .likesCount(10)
//                .userId(1)
//                .writeTime("20240731")
//                .dreamCategories(Collections.emptyList()) // 빈 리스트로 초기화
//                .build());
//
//        // when
//        DreamGetResponse retrievedDream = dreamService.getDream(dreamId);
//
//        // then
//        assertThat(retrievedDream.getContent()).isEqualTo("Content");
//        assertThat(retrievedDream.getImage()).isEqualTo("Image");
//        assertThat(retrievedDream.getInterpretation()).isEqualTo("Interpretation");
//        assertThat(retrievedDream.getSummary()).isEqualTo("Summary");
//        assertThat(retrievedDream.isShared()).isEqualTo(false);
//        assertThat(retrievedDream.getLikesCount()).isEqualTo(10);
//        assertThat(retrievedDream.getWriteTime()).isEqualTo("20240731");
//    }
//
//    @Test
//    void testUpdateDream() {
//        // given
//        Integer dreamId = 1;
//
//        // 기존 카테고리 생성
//        Category oldCategory1 = categoryRepository.save(new Category("OldCategory1", Type.dreamType));
//        Category oldCategory2 = categoryRepository.save(new Category("OldCategory2", Type.character));
//        Dream existingDream = Dream.builder()
//                .content("Old Content")
//                .image("Old Image")
//                .interpretation("Old Interpretation")
//                .summary("Old Summary")
//                .isShared(false)
//                .likesCount(10)
//                .userId(1)
//                .writeTime("20240731")
//                .dreamCategories(List.of()) // 빈 리스트로 초기화
//                .build();
//        DreamCategory oldDreamCategory1 = new DreamCategory(existingDream, oldCategory1);
//        DreamCategory oldDreamCategory2 = new DreamCategory(existingDream, oldCategory2);
//        existingDream.getDreamCategories().addAll(List.of(oldDreamCategory1, oldDreamCategory2));
//        existingDream = dreamRepository.save(existingDream);
//
//        // AI 응답 설정
//        String aiResponse = "{\"dreamType\": \"Updated Content\", \"character\": \"Updated Content\", \"mood\": \"Updated Content\", \"location\": \"Updated Content\", \"objects\": \"#UpdatedContent\"}";
//        when(chatModel.call(anyString())).thenReturn(aiResponse);
//
//        // 업데이트 요청
//        DreamUpdateRequest request = new DreamUpdateRequest(
//                "1",
//                "Updated Content",
//                "Updated Image",
//                "Updated Interpretation",
//                "Updated Summary",
//                "20240801",
//                Collections.emptyList()  // 새로운 카테고리는 비워둠
//        );
//
//        // when
//        Dream updatedDream = dreamService.update(dreamId, request);
//
//        // updatedDream이 null이 아닌지 확인
//        assertThat(updatedDream).isNotNull();
//
//        // then
//        assertThat(updatedDream.getContent()).isEqualTo("Updated Content");
//        assertThat(updatedDream.getImage()).isEqualTo("Updated Image");
//        assertThat(updatedDream.getInterpretation()).isEqualTo("Updated Interpretation");
//        assertThat(updatedDream.getSummary()).isNotEqualTo("Old Summary");
//        assertThat(updatedDream.getWriteTime()).isEqualTo("20240801");
//
//        // 카테고리 리스트가 업데이트되었는지 확인
//        List<DreamCategory> updatedCategories = updatedDream.getDreamCategories();
//        System.out.println("Updated Categories: " + updatedCategories);  // Debug 출력
//        assertThat(updatedCategories).hasSize(5);
//        assertThat(updatedCategories).extracting("category.word").containsExactlyInAnyOrder("Updated Content", "Updated Content", "Updated Content", "Updated Content", "#UpdatedContent");
//    }
//
//    private String SingleLineInterpretation(String message) {
//        // 프롬프트 작성 로직
//        String prompt = "사용자가 꾼 꿈의 내용은 다음과 같습니다: \"" + message + "\". " +
//                "이 꿈을 한 줄로 간단하게 해석해주세요.";
//        return chatModel.call(prompt);
//    }
//}

//package com.ssafy.dreamong.domain.entity.dream.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.ssafy.dreamong.domain.config.SecurityConfig;
//import com.ssafy.dreamong.domain.entity.common.ApiResponse;
//import com.ssafy.dreamong.domain.entity.dream.Dream;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamCreateRequest;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamGetResponse;
//import com.ssafy.dreamong.domain.entity.dream.dto.DreamMainResponse;
//import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
//import com.ssafy.dreamong.domain.entity.dream.service.DreamService;
//import com.ssafy.dreamong.domain.jwt.JWTUtil;
//import com.ssafy.dreamong.domain.oauth.CustomSuccessHandler;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Import;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.MvcResult;
//
//import java.util.Collections;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.mock;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@Configuration
//class TestSecurityConfig {
//
//    @Bean
//    public CustomSuccessHandler customSuccessHandler() {
//        return mock(CustomSuccessHandler.class);
//    }
//
//    @Bean
//    public JWTUtil jwtUtil() {
//        return mock(JWTUtil.class);
//    }
//}
//
//@WebMvcTest(DreamController.class)
//@Import({SecurityConfig.class, TestSecurityConfig.class})
//public class DreamControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private DreamService dreamService;
//
//    @MockBean
//    private DreamRepository dreamRepository; // 필요한 경우 추가
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    @WithMockUser
//    void testCreateDream() throws Exception {
//        // given
//        DreamCreateRequest request = new DreamCreateRequest("New Dream", "New Image", "New Interpretation", "New Summary", 1, "20240731", Collections.emptyList());
//        Dream response = Dream.builder()
//                .content("New Dream")
//                .image("New Image")
//                .interpretation("New Interpretation")
//                .summary("New Summary")
//                .isShared(false)
//                .likesCount(0)
//                .userId(1)
//                .writeTime("20240731")
//                .dreamCategories(Collections.emptyList())
//                .build();
//
//        // when
//        when(dreamService.create(any(DreamCreateRequest.class))).thenReturn(response);
//
//        // then
//        MvcResult result = mockMvc.perform(post("/dream/create")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(request))
//                        .accept(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        String jsonResponse = result.getResponse().getContentAsString();
//        ApiResponse<?> apiResponse = objectMapper.readValue(jsonResponse, ApiResponse.class);
//        Dream createdDream = objectMapper.convertValue(apiResponse.getData(), Dream.class);
//
//        assertThat(createdDream.getContent()).isEqualTo(response.getContent());
//        assertThat(createdDream.getImage()).isEqualTo(response.getImage());
//        assertThat(createdDream.getInterpretation()).isEqualTo(response.getInterpretation());
//    }
//
//    @Test
//    @WithMockUser
//    void testFindAllDreams() throws Exception {
//        // given
//        Integer userId = 1;
//        String writeTime = "20240731";
//        DreamMainResponse response1 = new DreamMainResponse("Content1", "Image1", "20240731");
//        DreamMainResponse response2 = new DreamMainResponse("Content2", "Image2", "20240731");
//        List<DreamMainResponse> responses = List.of(response1, response2);
//
//        // when
//        when(dreamService.getDreamsByUserIdAndWriteTime(userId, writeTime)).thenReturn(responses);
//
//        // then
//        MvcResult result = mockMvc.perform(get("/dream/{userId}/{writeTime}", userId, writeTime)
//                        .accept(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        String jsonResponse = result.getResponse().getContentAsString();
//        ApiResponse<?> apiResponse = objectMapper.readValue(jsonResponse, ApiResponse.class);
//        List<DreamMainResponse> retrievedDreams = objectMapper.convertValue(apiResponse.getData(), objectMapper.getTypeFactory().constructCollectionType(List.class, DreamMainResponse.class));
//
//        assertThat(retrievedDreams.size()).isEqualTo(2);
//        assertThat(retrievedDreams.get(0).getContent()).isEqualTo(response1.getContent());
//        assertThat(retrievedDreams.get(1).getContent()).isEqualTo(response2.getContent());
//    }
//
//    @Test
//    @WithMockUser
//    void testGetDream() throws Exception {
//        // given
//        Integer dreamId = 1;
//        DreamGetResponse response = new DreamGetResponse("Content", "Image", "Interpretation", "Summary", false, 10, "20240731");
//
//        // when
//        when(dreamService.getDream(dreamId)).thenReturn(response);
//
//        // then
//        MvcResult result = mockMvc.perform(get("/dream/{dreamId}", dreamId)
//                        .accept(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        String jsonResponse = result.getResponse().getContentAsString();
//        ApiResponse<?> apiResponse = objectMapper.readValue(jsonResponse, ApiResponse.class);
//        DreamGetResponse retrievedDream = objectMapper.convertValue(apiResponse.getData(), DreamGetResponse.class);
//
//        assertThat(retrievedDream.getContent()).isEqualTo(response.getContent());
//        assertThat(retrievedDream.getImage()).isEqualTo(response.getImage());
//        assertThat(retrievedDream.getInterpretation()).isEqualTo(response.getInterpretation());
//    }
//}

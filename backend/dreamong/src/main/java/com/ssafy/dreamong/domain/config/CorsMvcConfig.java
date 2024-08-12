//package com.ssafy.dreamong.domain.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
///**
// * 로그인의 경우 시큐리티 필터만 통과 후 응답이 되기 때문에 SecurityConfig에 설정한 CORS 값으로 진행되고,
// * 컨트롤러를 타고 응답되는 경우 WebMvcConfigurer 설정을 통해 진행
// */
//
//@Configuration
//public class CorsMvcConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry corsRegistry) {
//
//        corsRegistry.addMapping("/**")
//                .allowedOrigins("http://localhost:5173",
//                        "https://localhost:5173",
//                        "http://localhost:8080",
//                        "https://i11c106.p.ssafy.io",
//                        "http://i11c106.p.ssafy.io",
//                        "http://localhost:3000")
//                .allowedMethods("*")
//                .allowedHeaders("*")
//                .exposedHeaders("Set-Cookie", "Authorization")
//                .allowCredentials(true)
//                .maxAge(3600L);
//    }
//}

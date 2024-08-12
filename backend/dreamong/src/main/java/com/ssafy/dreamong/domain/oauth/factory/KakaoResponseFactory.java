package com.ssafy.dreamong.domain.oauth.factory;

import com.ssafy.dreamong.domain.oauth.dto.KakaoResponse;
import com.ssafy.dreamong.domain.oauth.dto.OAuth2Response;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("kakao")
public class KakaoResponseFactory implements OAuth2ResponseFactory {
    @Override
    public OAuth2Response create(Map<String, Object> attributes) {
        return new KakaoResponse(attributes);
    }
}
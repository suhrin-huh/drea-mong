package com.ssafy.dreamong.domain.oauth.factory;

import com.ssafy.dreamong.domain.oauth.dto.GoogleResponse;
import com.ssafy.dreamong.domain.oauth.dto.OAuth2Response;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("google")
public class GoogleResponseFactory implements OAuth2ResponseFactory {
    @Override
    public OAuth2Response create(Map<String, Object> attributes) {
        return new GoogleResponse(attributes);
    }
}
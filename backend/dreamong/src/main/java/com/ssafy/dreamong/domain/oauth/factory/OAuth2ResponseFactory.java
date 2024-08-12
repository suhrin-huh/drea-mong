package com.ssafy.dreamong.domain.oauth.factory;

import com.ssafy.dreamong.domain.oauth.dto.OAuth2Response;

import java.util.Map;

public interface OAuth2ResponseFactory {
    OAuth2Response create(Map<String, Object> attributes);
}

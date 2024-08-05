package com.ssafy.dreamong.domain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeepLConfig {

    @Value("${deepl.api.url}")
    private String deeplApiUrl;

    @Value("${deepl.api.key}")
    private String deeplApiKey;

    public String getDeeplApiUrl() {
        return deeplApiUrl;
    }

    public String getDeeplApiKey() {
        return deeplApiKey;
    }
}
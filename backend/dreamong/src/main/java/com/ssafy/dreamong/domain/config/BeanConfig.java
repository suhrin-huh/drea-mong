package com.ssafy.dreamong.domain.config;

import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class BeanConfig {

    @Bean
    public RestClientCustomizer restClientCustomizer() {
        return builder ->
                builder.requestFactory(
                        ClientHttpRequestFactories.get(
                                SimpleClientHttpRequestFactory.class,
                                ClientHttpRequestFactorySettings.DEFAULTS));
    }
}

package com.ssafy.dreamong.domain.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.ForwardedHeaderFilter;

/**
 * Proxy 환경에서는 ForwardedHeaderFilter 가 실행되서 HTTP 요청의
 * Forwarded 헤더 또는 X-Forwarded-* 헤더를 처리하여 원래의 요청 정보를 복원
 */
@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<ForwardedHeaderFilter> forwardedHeaderFilter() {
        FilterRegistrationBean<ForwardedHeaderFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new ForwardedHeaderFilter());
        // 필터 적용의 위치를 가장 초기 위치에 적용!
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}

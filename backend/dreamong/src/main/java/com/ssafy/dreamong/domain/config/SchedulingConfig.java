package com.ssafy.dreamong.domain.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {

//    @Bean
//    public TaskScheduler taskScheduler() {
//        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
//        scheduler.setPoolSize(10); // 기본 스레드 풀 크기 설정
//        scheduler.setThreadNamePrefix("scheduled-task-");
//        scheduler.initialize();
//        return scheduler;
//    }
}
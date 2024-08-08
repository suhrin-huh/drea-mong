package com.ssafy.dreamong.domain.entity.notification;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    MORNING_WAKEUP_REMINDER("기상 시간입니다!", "오늘은 어떤 꿈을 꾸셨나요?"),
    SLEEP_REMINDER("취침 시간 10분 전입니다.", "취침 준비를 하세요!");

    private final String title;
    private final String body;
}
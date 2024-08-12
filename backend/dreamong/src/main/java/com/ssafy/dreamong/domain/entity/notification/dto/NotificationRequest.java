package com.ssafy.dreamong.domain.entity.notification.dto;

import com.ssafy.dreamong.domain.entity.notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Integer userId;
    private NotificationType notificationType;
    private LocalDateTime scheduleTime;
}


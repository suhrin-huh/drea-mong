package com.ssafy.dreamong.domain.entity.notification.controller;

import com.ssafy.dreamong.domain.entity.notification.dto.NotificationRequest;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.entity.notification.repository.NotificationRepository;
import com.ssafy.dreamong.domain.entity.notification.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @PostMapping("/schedule")
    public Notification scheduleNotification(@RequestBody NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .notificationType(request.getNotificationType())
                .scheduleTime(request.getScheduleTime())
                .build();

        return notificationRepository.save(notification);
    }
}
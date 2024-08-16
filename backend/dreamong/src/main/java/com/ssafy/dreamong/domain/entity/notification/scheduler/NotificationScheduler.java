package com.ssafy.dreamong.domain.entity.notification.scheduler;

import com.ssafy.dreamong.domain.entity.notification.Notification;
import com.ssafy.dreamong.domain.entity.notification.repository.NotificationRepository;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.fcm.FcmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@EnableScheduling
@Slf4j
public class NotificationScheduler {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FcmService fcmService;

//    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void checkAndSendNotifications() {
        List<Notification> notifications = notificationRepository
                .findByScheduleTimeBeforeAndSentFalse(LocalDateTime.now());

        for (Notification notification : notifications) {
            try {
                User user = userRepository.findById(notification.getUser().getId())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                String userToken = user.getFcmToken();
                if (userToken != null) {
                    // Enum을 사용하여 알림 메시지 설정
                    fcmService.sendNotification(
                            userToken,
                            notification.getNotificationType().getTitle(),
                            notification.getNotificationType().getBody()
                    );
                    notification.updateSentStatus(true);
                    notificationRepository.save(notification);
                }
            } catch (Exception e) {
                log.info("{}", e.getMessage());
            }
        }
    }
}

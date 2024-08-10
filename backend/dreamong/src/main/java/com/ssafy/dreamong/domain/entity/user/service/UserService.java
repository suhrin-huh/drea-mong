package com.ssafy.dreamong.domain.entity.user.service;

import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.dto.UserInfoResponse;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.entity.notification.repository.NotificationRepository;
import com.ssafy.dreamong.domain.entity.notification.Notification;
import com.ssafy.dreamong.domain.entity.notification.NotificationType;
import com.ssafy.dreamong.domain.exception.NicknameAlreadyExistsException;
import com.ssafy.dreamong.domain.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    private User findUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }

    public UserInfoResponse getUserInfo(Integer userId) {
        User user = findUserById(userId);
        return new UserInfoResponse(user.getId(), user.getEmail(), user.getNickname(), user.getRole());
    }

    @Transactional
    public void clearRefreshToken(Integer userId) {
        User user = findUserById(userId);
        user.updateRefreshToken(null);
    }

    @Transactional
    public void updateNickname(Integer userId, String newNickname) {
        if (userRepository.existsByNickname(newNickname)) {
            throw new NicknameAlreadyExistsException("Nickname already exists");
        }

        User user = findUserById(userId);
        user.updateNickname(newNickname);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserFcmToken(Integer userId, String fcmToken) {
        User user = findUserById(userId);
        user.saveFcmToken(fcmToken);
        userRepository.save(user);
    }


    // 사용자가 취침 시간을 설정할 때
    @Transactional
    public void scheduleSleepReminder(Integer userId, LocalDateTime bedtime) {
        User user = findUserById(userId);
        // 취침 시간 10분 전
        LocalDateTime reminderTime = bedtime.minusMinutes(10);

        Notification sleepReminder = Notification.builder()
                .user(user)
                .notificationType(NotificationType.SLEEP_REMINDER)
                .scheduleTime(reminderTime)
                .build();

        notificationRepository.save(sleepReminder);
    }

    // 기상 시간 알림 설정 로직
    @Transactional
    public void scheduleMorningWakeup(Integer userId, LocalDateTime wakeupTime) {
        User user = findUserById(userId);

        Notification wakeupReminder = Notification.builder()
                .user(user)
                .notificationType(NotificationType.MORNING_WAKEUP_REMINDER)
                .scheduleTime(wakeupTime)
                .build();

        notificationRepository.save(wakeupReminder);
    }
}

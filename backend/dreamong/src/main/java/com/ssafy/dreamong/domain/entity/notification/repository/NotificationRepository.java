package com.ssafy.dreamong.domain.entity.notification.repository;

import com.ssafy.dreamong.domain.entity.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // 스케줄된 시간 전에 전송되지 않은 알림 조회
    List<Notification> findByScheduleTimeBeforeAndSentFalse(LocalDateTime now);
}
package com.ssafy.dreamong.domain.entity.notification;

import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import com.ssafy.dreamong.domain.entity.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    private LocalDateTime scheduleTime;
    private Boolean sent = false;

    @Builder
    public Notification(User user, NotificationType notificationType, LocalDateTime scheduleTime) {
        this.user = user;
        this.notificationType = notificationType;
        this.scheduleTime = scheduleTime;
    }

    public void updateSentStatus(Boolean status) {
        this.sent = status;
    }
}

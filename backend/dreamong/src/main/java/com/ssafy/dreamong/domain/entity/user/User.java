package com.ssafy.dreamong.domain.entity.user;

import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;
    @Column(name = "email", nullable = false)
    private String email;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "provider_user_id", nullable = false, unique = true)
    private String providerUserId; // 외부 제공자와 관련된 고유 식별자
    @Column(name = "nickname")
    private String nickname; // 사용자 인터페이스에 표시될 이름
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;
    @Column(name = "refresh_token")
    private String refreshToken;
    @Column(name = "fcm_token")
    private String fcmToken;

    private User(String email, String name, String providerUserId) {
        this.email = email;
        this.name = name;
        this.providerUserId = providerUserId;
    }

    public static User createUser(String email, String name, String providerUserId) {
        return new User(email, name, providerUserId);
    }

    public void updateUserInfo(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void saveFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }
}

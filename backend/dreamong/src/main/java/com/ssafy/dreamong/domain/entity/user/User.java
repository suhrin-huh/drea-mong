package com.ssafy.dreamong.domain.entity.user;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;
    @Column(name = "email")
    private String email;
    @Column(name = "name")
    private String name;
    @Column(name = "provider_user_id")
    private String providerUserId; // 외부 제공자와 관련된 고유 식별자
    @Column(name = "nickname")
    private String nickname; // 사용자 인터페이스에 표시될 이름
    @Enumerated(EnumType.STRING)
    private Role role;
    @Column(name = "refresh_token")
    private String refreshToken;
    @Column(name = "fcm_token")
    private String fcmToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    private User(String email, String name, String providerUserId, Role role) {
        this.email = email;
        this.name = name;
        this.providerUserId = providerUserId;
        this.role = role;
    }

    public static User createUser(String email, String name, String providerUserId, Role role) {
        return new User(email, name, providerUserId, role);
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

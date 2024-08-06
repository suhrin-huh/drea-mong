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
    private Integer id;
    private String email;
    private String name;
    private String providerUserId; // 외부 제공자와 관련된 고유 식별자
    private String nickname; // 사용자 인터페이스에 표시될 이름
    @Enumerated(EnumType.STRING)
    private Role role;
    private String refreshToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    private User(String email, String name, String providerUserId, String nickname, Role role) {
        this.email = email;
        this.name = name;
        this.providerUserId = providerUserId;
        this.nickname = nickname;
        this.role = role;
    }

    public static User createUser(String email, String name, String providerUserId, String nickname, Role role) {
        return new User(email, name, providerUserId, nickname, role);
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
}

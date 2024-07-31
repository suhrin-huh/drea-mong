package com.ssafy.dreamong.domain.entity.dreamlike;

import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "dream_like")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DreamLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dream_like_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id")
    private Dream dream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public DreamLike(Dream dream, User user) {
        this.dream = dream;
        this.user = user;
    }

    public void setDream(Dream dream) {
        this.dream = dream;
        dream.getDreamLikes().add(this);
    }

//    public void setUser(User user) {
//        this.user = user;
//        user.getDreamLikes().add(this);
//    }
}

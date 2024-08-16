package com.ssafy.dreamong.domain.entity.comment;

import com.ssafy.dreamong.domain.entity.commentlike.CommentLike;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "comment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer id;

    @Column(name = "content")
    private String content;

    @Column(name = "likes_count")
    private Integer likesCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id")
    private Dream dream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL)
    private List<CommentLike> commentsLikes = new ArrayList<>();

    public Comment(String content, Integer likesCount, Dream dream, User user) {
        this.content = content;
        this.likesCount = likesCount;
        this.dream = dream;
        this.user = user;
    }

    public void addCommentLike(CommentLike commentLike) {
        this.commentsLikes.add(commentLike);
        commentLike.setComment(this);
    }

    public void updateLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
}

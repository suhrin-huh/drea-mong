package com.ssafy.dreamong.domain.entity.commentlike;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "comment_like")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_like_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public CommentLike(Comment comment, User user) {
        this.comment = comment;
        this.user = user;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
        comment.getCommentsLikes().add(this);
    }
}

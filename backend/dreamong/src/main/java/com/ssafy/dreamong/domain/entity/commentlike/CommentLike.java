package com.ssafy.dreamong.domain.entity.commentlike;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "comment_like")
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_like_id")
    private Integer id;

    @Column(name = "comment_id")
    private Integer commentId;

    @Column(name = "user_id")
    private Integer userId;
}

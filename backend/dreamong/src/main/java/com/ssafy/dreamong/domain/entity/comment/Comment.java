package com.ssafy.dreamong.domain.entity.comment;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "comment")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String content;

    @Column(name = "likes_count")
    private Integer likesCount;

    @Column(name = "dream_id")
    private Integer dreamId;

    @Column(name = "user_id")
    private Integer userId;
}

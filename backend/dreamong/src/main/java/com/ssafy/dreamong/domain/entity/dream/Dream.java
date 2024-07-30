package com.ssafy.dreamong.domain.entity.dream;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import com.ssafy.dreamong.domain.entity.dreamlike.DreamLike;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.List;

@Entity
@Getter
@Table(name = "dream")
public class Dream extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "dream_id")
    private Integer id;

    @Column(name = "content")
    private String content;

    @Column(name = "image")
    private String image;

    @Column(name = "interpretation")
    private String interpretation;

    @Column(name = "summary")
    private String summary;

    @Column(name = "is_shared")
    private boolean isShared;

    @Column(name = "likes_count")
    private Integer likesCount;

    @Column(name = "user_id")
    private Integer userId;

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<DreamCategory> dreamCategories;

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<DreamLike> dreamLikes;

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Comment> comments;
}

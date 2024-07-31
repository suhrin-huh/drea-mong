package com.ssafy.dreamong.domain.entity.dream;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import com.ssafy.dreamong.domain.entity.dreamlike.DreamLike;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "dream")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Dream extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dream_id")
    private Integer id;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "image")
    private String image;

    @Column(name = "interpretation")
    private String interpretation;

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "is_shared", columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isShared;

    @Column(name = "likes_count")
    private Integer likesCount;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "write_time", nullable = false)
    private String writeTime;

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DreamCategory> dreamCategories = new ArrayList<>();

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL)
    private List<DreamLike> dreamLikes = new ArrayList<>();

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @Builder
    public Dream(Integer id, String content, String image, String interpretation,
                 String summary, boolean isShared, Integer likesCount,
                 Integer userId, String writeTime, List<DreamCategory> dreamCategories) {
        this.id = id;
        this.content = content;
        this.image = image;
        this.interpretation = interpretation;
        this.summary = summary;
        this.isShared = isShared;
        this.likesCount = likesCount;
        this.writeTime = writeTime;
        this.userId = userId;
        this.dreamCategories = new ArrayList<>(dreamCategories);
        for (DreamCategory dreamCategory : dreamCategories) {
            dreamCategory.setDream(this);
        }
    }

    public void addDreamCategory(DreamCategory dreamCategory) {
        this.dreamCategories.add(dreamCategory);
        dreamCategory.setDream(this);
    }

    public void addDreamLike(DreamLike dreamLike) {
        this.dreamLikes.add(dreamLike);
        dreamLike.setDream(this);
    }

    public void addComment(Comment comment) {
        this.comments.add(comment);
        comment.setDream(this);
    }

    public void updateDreamCategories(List<DreamCategory> newCategories) {
        this.dreamCategories.clear();
        for (DreamCategory newCategory : newCategories) {
            addDreamCategory(newCategory);
        }
    }
}


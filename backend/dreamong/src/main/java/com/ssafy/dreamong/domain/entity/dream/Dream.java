package com.ssafy.dreamong.domain.entity.dream;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
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

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "image")
    private String image;

    @Lob
    @Column(name = "interpretation", columnDefinition = "TEXT")
    private String interpretation;

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "is_shared")
    private boolean isShared;

    @Column(name = "likes_count")
    private Integer likesCount;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "write_time", nullable = false)
    private String writeTime;

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DreamCategory> dreamCategories = new ArrayList<>();

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = true)
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
        if (dreamCategories != null) {
            this.dreamCategories = new ArrayList<>(dreamCategories);
        }
    }

    public void addDreamCategory(DreamCategory dreamCategory) {
        this.dreamCategories.add(dreamCategory);
    }

    public void update(String content, String image, String interpretation, String summary, String writeTime, boolean isShared, List<DreamCategory> newCategories) {
        this.content = content;
        this.image = image;
        this.interpretation = interpretation;
        this.summary = summary;
        this.writeTime = writeTime;
        this.isShared = isShared;
        setDreamCategories(newCategories);
    }

    private void setDreamCategories(List<DreamCategory> newCategories) {
        this.dreamCategories.clear();
        for (DreamCategory category : newCategories) {
            this.addDreamCategory(category);
        }
    }

    public void updateLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
}
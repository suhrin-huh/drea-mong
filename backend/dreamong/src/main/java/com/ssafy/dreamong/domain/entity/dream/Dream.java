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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private Set<DreamCategory> dreamCategories = new HashSet<>();

    @OneToMany(mappedBy = "dream", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @Builder
    public Dream(Integer id, String content, String image, String interpretation,
                 String summary, boolean isShared, Integer likesCount,
                 Integer userId, String writeTime, Set<DreamCategory> dreamCategories) {
        this.id = id;
        this.content = content;
        this.image = image;
        this.interpretation = interpretation;
        this.summary = summary;
        this.isShared = isShared;
        this.likesCount = likesCount;
        this.userId = userId;
        this.writeTime = writeTime;
        if (dreamCategories != null) {
            this.dreamCategories = new HashSet<>(dreamCategories);
        }
    }

    public void addDreamCategory(DreamCategory dreamCategory) {
        if (!this.dreamCategories.contains(dreamCategory)) {
            this.dreamCategories.add(dreamCategory);
        }
    }


    public void update(String content, String image, String interpretation, String summary, String writeTime, boolean isShared, Set<DreamCategory> newCategories) {
        this.content = content;
        this.image = image;
        this.interpretation = interpretation;
        this.summary = summary;
        this.writeTime = writeTime;
        this.isShared = isShared;
        setDreamCategories(newCategories);
    }

    private void setDreamCategories(Set<DreamCategory> newCategories) {
        this.dreamCategories.clear();
        this.dreamCategories.addAll(newCategories);
    }

    public void updateLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }
}
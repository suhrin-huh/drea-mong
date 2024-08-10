package com.ssafy.dreamong.domain.entity.dreamcategory;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "dream_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DreamCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dream_category_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dream_id")
    private Dream dream;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Builder
    public DreamCategory(Dream dream, Category category) {
        this.dream = dream;
        this.category = category;
        // 양방향 관계 설정
        if (dream != null) {
            dream.addDreamCategory(this);
        }
        if (category != null) {
            category.addDreamCategory(this);
        }
    }

    public String getDreamType() {
        return this.category.getType().toString();
    }
}
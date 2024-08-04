package com.ssafy.dreamong.domain.entity.dreamcategory;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonBackReference;

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

    public DreamCategory(Dream dream, Category category) {
        this.dream = dream;
        this.category = category;
        dream.getDreamCategories().add(this); // Dream에 추가
        category.getDreamCategories().add(this); // Category에 추가
    }
}






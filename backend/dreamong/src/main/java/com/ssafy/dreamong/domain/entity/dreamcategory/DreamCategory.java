package com.ssafy.dreamong.domain.entity.dreamcategory;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "dream_category")
@NoArgsConstructor
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
    }

    public void setDream(Dream dream) {
        this.dream = dream;
        if (!dream.getDreamCategories().contains(this)) {
            dream.getDreamCategories().add(this);
        }
    }

    public void setCategory(Category category) {
        this.category = category;
        if (!category.getDreamCategories().contains(this)) {
            category.getDreamCategories().add(this);
        }
    }
}

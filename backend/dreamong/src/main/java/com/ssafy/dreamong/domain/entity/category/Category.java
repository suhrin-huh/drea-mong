package com.ssafy.dreamong.domain.entity.category;

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
@Table(name = "category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer id;

    @Column(name = "word")
    private String word;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "type")
    private Type type;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DreamCategory> dreamCategories = new ArrayList<>();

    @Builder
    public Category(String word, Type type) {
        this.word = word;
        this.type = type;
    }

    public void addDreamCategory(DreamCategory dreamCategory) {
        if (!this.dreamCategories.contains(dreamCategory)) {
            this.dreamCategories.add(dreamCategory);
        }
    }

}
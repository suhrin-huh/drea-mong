package com.ssafy.dreamong.domain.entity.category;

import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.List;

@Entity
@Getter
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JoinColumn(name = "category_id")
    private Integer id;

    @Column(name = "word")
    private String word;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "type")
    private Type type;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<DreamCategory> dreamCategories;
}

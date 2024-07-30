package com.ssafy.dreamong.domain.entity.dreamcategory;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "dream_category")
public class DreamCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "dream_id")
    private Integer dreamId;

    @Column(name = "category_id")
    private Integer categoryId;
}

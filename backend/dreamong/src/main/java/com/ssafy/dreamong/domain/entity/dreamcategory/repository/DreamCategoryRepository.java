package com.ssafy.dreamong.domain.entity.dreamcategory.repository;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dreamcategory.DreamCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DreamCategoryRepository extends JpaRepository<DreamCategory, Integer> {
    boolean existsByDreamAndCategory(Dream dream, Category category);
}
package com.ssafy.dreamong.domain.entity.category.repository;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByWordAndType(String word, Type type);

    @Query("SELECT c FROM Category c WHERE c.type = :type ORDER BY SIZE(c.dreamCategories) DESC")
    List<Category> findTop3ByTypeOrderByDreamCategoriesSizeDesc(@Param("type") Type type);
}


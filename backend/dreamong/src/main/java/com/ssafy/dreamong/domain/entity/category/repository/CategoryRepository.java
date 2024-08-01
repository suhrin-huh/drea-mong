package com.ssafy.dreamong.domain.entity.category.repository;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByWordAndType(String word, Type type);
}


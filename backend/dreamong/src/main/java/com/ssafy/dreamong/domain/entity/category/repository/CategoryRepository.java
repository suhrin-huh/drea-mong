package com.ssafy.dreamong.domain.entity.category.repository;

import com.ssafy.dreamong.domain.entity.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}

package com.ssafy.dreamong.domain.entity.category.service;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    
    //카테고리별 조회
    public Map<Type, List<Category>> getTop3CategoriesByType() {
        Map<Type, List<Category>> topCategoriesByType = new EnumMap<>(Type.class);

        for (Type type : Type.values()) {
            List<Category> topCategories = categoryRepository.findTop3ByTypeOrderByDreamCategoriesSizeDesc(type);
            topCategoriesByType.put(type, topCategories);
        }

        return topCategoriesByType;
    }
}

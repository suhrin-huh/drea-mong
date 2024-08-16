package com.ssafy.dreamong.domain.entity.category.repository;

import com.ssafy.dreamong.domain.entity.category.Category;
import com.ssafy.dreamong.domain.entity.category.Type;
import com.ssafy.dreamong.domain.entity.category.dto.DreamTypeCountDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findByWordAndType(String word, Type type);

    // 꿈 종류 데이터 (전체)
    @Query("SELECT c FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d WHERE d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'dreamType'")
    List<Category> findDreamCategoriesByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // 기분 데이터 (전체)
    @Query("SELECT c FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d WHERE d.userId = :userId AND d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'mood'")
    List<Category> findMoodCategoriesByDateRangeAndUserId(@Param("userId") Integer userId, @Param("startDate") String startDate, @Param("endDate") String endDate);

    // 인물 데이터 (빈도수 상위 3개)
    @Query(value = "SELECT c FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d WHERE d.userId = :userId AND d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'character' GROUP BY c.id ORDER BY COUNT(dc) DESC")
    List<Category> findCharacterCategoriesByDateRangeAndUserId(@Param("userId") Integer userId, @Param("startDate") String startDate, @Param("endDate") String endDate);

    // 장소 데이터 (빈도수 상위 3개)
    @Query(value = "SELECT c FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d WHERE d.userId = :userId AND d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'location' GROUP BY c.id ORDER BY COUNT(dc) DESC")
    List<Category> findLocationCategoriesByDateRangeAndUserId(@Param("userId") Integer userId, @Param("startDate") String startDate, @Param("endDate") String endDate);

    // 사물 데이터 (빈도수 상위 3개)
    @Query(value = "SELECT c FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d WHERE d.userId = :userId AND d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'objects' GROUP BY c.id ORDER BY COUNT(dc) DESC")
    List<Category> findObjectCategoriesByDateRangeAndUserId(@Param("userId") Integer userId, @Param("startDate") String startDate, @Param("endDate") String endDate);

    // 꿈 종류별 카운트 데이터
    @Query("SELECT new com.ssafy.dreamong.domain.entity.category.dto.DreamTypeCountDto(c.word, COUNT(dc)) " +
            "FROM Category c JOIN c.dreamCategories dc JOIN dc.dream d " +
            "WHERE d.userId = :userId AND d.writeTime BETWEEN :startDate AND :endDate AND c.type = 'dreamType' " +
            "GROUP BY c.word")
    List<DreamTypeCountDto> countDreamTypesByDateRangeAndUserId(@Param("userId") Integer userId, @Param("startDate") String startDate, @Param("endDate") String endDate);
}

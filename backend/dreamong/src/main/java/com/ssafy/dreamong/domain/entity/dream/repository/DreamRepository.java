package com.ssafy.dreamong.domain.entity.dream.repository;

import com.ssafy.dreamong.domain.entity.dream.Dream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DreamRepository extends JpaRepository<Dream, Integer> {
    @Query("SELECT d FROM Dream d WHERE d.userId = :userId AND d.writeTime LIKE :writeTime% ORDER BY d.writeTime DESC")
    List<Dream> findAllByUserIdAndWriteTimeLikeOrderByWriteTimeDesc(@Param("userId") Integer userId, @Param("writeTime") String writeTime);

    long countByUserId(Integer userId);

    // 커서를 사용한 페이징 메서드
    List<Dream> findByIsSharedTrueAndIdLessThanOrderByIdDesc(Integer cursorId, Pageable pageable);

    // 처음 요청 시 사용할 메서드
    List<Dream> findByIsSharedTrueOrderByIdDesc(Pageable pageable);
}

package com.ssafy.dreamong.domain.entity.dream.repository;

import com.ssafy.dreamong.domain.entity.dream.Dream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DreamRepository extends JpaRepository<Dream, Integer> {
    @Query("SELECT d FROM Dream d WHERE d.userId = :userId AND d.writeTime LIKE :writeTime% ORDER BY d.writeTime DESC")
    List<Dream> findAllByUserIdAndWriteTimeLikeOrderByWriteTimeDesc(@Param("userId") Integer userId, @Param("writeTime") String writeTime);
}

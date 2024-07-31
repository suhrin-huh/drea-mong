package com.ssafy.dreamong.domain.entity.dream.repository;

import com.ssafy.dreamong.domain.entity.dream.Dream;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DreamRepository extends JpaRepository<Dream, Integer> {
    List<Dream> findAllByUserIdOrderByWriteTimeDesc(Integer userId);
}

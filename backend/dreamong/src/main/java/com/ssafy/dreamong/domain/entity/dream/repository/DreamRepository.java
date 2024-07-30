package com.ssafy.dreamong.domain.entity.dream.repository;

import com.ssafy.dreamong.domain.entity.dream.Dream;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DreamRepository extends JpaRepository<Dream, Integer> {
}

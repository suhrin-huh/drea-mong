package com.ssafy.dreamong.domain.entity.commentlike.repository;

import com.ssafy.dreamong.domain.entity.commentlike.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Integer> {
}

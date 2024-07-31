package com.ssafy.dreamong.domain.entity.comment.repository;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
}

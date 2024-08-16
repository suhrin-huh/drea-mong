package com.ssafy.dreamong.domain.entity.commentlike.repository;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.commentlike.CommentLike;
import com.ssafy.dreamong.domain.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Integer> {
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
}

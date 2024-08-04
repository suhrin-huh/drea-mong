package com.ssafy.dreamong.domain.entity.comment.service;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.repository.CommentRepository;
import com.ssafy.dreamong.domain.entity.commentlike.CommentLike;
import com.ssafy.dreamong.domain.entity.commentlike.repository.CommentLikeRepository;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.exception.InvalidCommentException;
import com.ssafy.dreamong.domain.exception.InvalidDreamException;
import com.ssafy.dreamong.domain.exception.InvalidUserException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;

    // 댓글 생성
    @Transactional
    public Comment createComment(CommentRequest request) {
        Dream dream = dreamRepository.findById(request.getDreamId())
                .orElseThrow(() -> new InvalidDreamException("Invalid dream ID: " + request.getDreamId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new InvalidUserException("Invalid user ID: " + request.getUserId()));

        Comment comment = new Comment(request.getContent(), 0, dream, user);
        return commentRepository.save(comment);
    }

    // 좋아요 토글
    @Transactional
    public boolean toggleCommentLike(Integer userId, Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new InvalidCommentException("Invalid comment ID: " + commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidUserException("Invalid user ID: " + userId));

        Optional<CommentLike> commentLikeOptional = commentLikeRepository.findByCommentAndUser(comment, user);

        if (commentLikeOptional.isPresent()) {
            commentLikeRepository.delete(commentLikeOptional.get());
            comment.updateLikesCount(comment.getLikesCount() - 1);
        } else {
            CommentLike commentLike = new CommentLike(comment, user);
            commentLikeRepository.save(commentLike);
            comment.updateLikesCount(comment.getLikesCount() + 1);
        }

        commentRepository.save(comment);
        return !commentLikeOptional.isPresent();
    }

    // 댓글 삭제
    @Transactional
    public boolean deleteComment(Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new InvalidCommentException("Invalid comment ID: " + commentId));
        commentRepository.delete(comment);
        return true;
    }
}

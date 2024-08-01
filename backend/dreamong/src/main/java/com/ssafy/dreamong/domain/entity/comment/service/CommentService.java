package com.ssafy.dreamong.domain.entity.comment.service;

import com.ssafy.dreamong.domain.entity.comment.Comment;
import com.ssafy.dreamong.domain.entity.comment.dto.CommentRequest;
import com.ssafy.dreamong.domain.entity.comment.dto.CommentUpdateLikesDto;
import com.ssafy.dreamong.domain.entity.comment.repository.CommentRepository;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final DreamRepository dreamRepository;
    private final UserRepository userRepository;

    // 댓글 생성
    @Transactional
    public Comment createComment(CommentRequest request) {
        System.out.println("CommentRequest: " + request);

        Dream dream = dreamRepository.findById(request.getDreamId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid dream ID: " + request.getDreamId()));
        System.out.println("Dream: " + dream);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID: " + request.getUserId()));
        System.out.println("User: " + user);

        Comment comment = new Comment(request.getContent(), 0, dream, user);
        return commentRepository.save(comment);
    }

    @Transactional
    public void incrementCommentLikes(Integer userId, Integer dreamId, Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid comment ID: " + commentId));
        Dream dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid dream ID: " + dreamId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID: " + userId));

        // 좋아요 추가 로직 (User와 Comment의 관계를 저장하는 등)
        comment.updateLikesCount(comment.getLikesCount() + 1);
        commentRepository.save(comment);
    }

    @Transactional
    public void decrementCommentLikes(Integer userId, Integer dreamId, Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid comment ID: " + commentId));
        Dream dream = dreamRepository.findById(dreamId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid dream ID: " + dreamId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID: " + userId));

        // 좋아요 취소 로직 (User와 Comment의 관계를 삭제하는 등)
        comment.updateLikesCount(comment.getLikesCount() - 1);
        commentRepository.save(comment);
    }
}

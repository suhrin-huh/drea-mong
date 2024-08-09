package com.ssafy.dreamong.domain.entity.dream.service;

import com.ssafy.dreamong.domain.entity.comment.dto.CommentResponse;
import com.ssafy.dreamong.domain.entity.commentlike.repository.CommentLikeRepository;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.exception.InvalidDreamException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SquareService {

    private final DreamRepository dreamRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserRepository userRepository;

    // 꿈 광장 조회 (커서 기반)
    public List<SquareGetResponseDto> getAllSharedDreams(Integer cursorId, int size) {
        Pageable pageable = PageRequest.of(0, size);
        List<Dream> sharedDreams;

        if (cursorId == null) {
            sharedDreams = dreamRepository.findByIsSharedTrueOrderByIdDesc(pageable);
        } else {
            sharedDreams = dreamRepository.findByIsSharedTrueAndIdLessThanOrderByIdDesc(cursorId, pageable);
        }

        return sharedDreams.stream()
                .map(dream -> new SquareGetResponseDto(dream.getId(), dream.getUserId(), dream.getImage()))
                .collect(Collectors.toList());
    }

    // 꿈 광장 상세 보기
    public SquareDetailResponse getDreamDetail(Integer dreamId, Integer userId) {
        Dream dream = dreamRepository.findById(dreamId)
                .filter(Dream::isShared)
                .orElseThrow(() -> new InvalidDreamException("Invalid dream or user ID"));

        List<CommentResponse> comments = dream.getComments().stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getLikesCount(),
                        comment.getUser().getNickname(),
                        comment.getUser().getId().equals(userId))) // 닉네임 포함
                .collect(Collectors.toList());

        return new SquareDetailResponse(dream.getSummary(), dream.getContent(), dream.getImage(), comments);
    }
}

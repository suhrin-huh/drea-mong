package com.ssafy.dreamong.domain.entity.dream.service;

import com.ssafy.dreamong.domain.entity.commentlike.repository.CommentLikeRepository;
import com.ssafy.dreamong.domain.entity.dream.Dream;
import com.ssafy.dreamong.domain.entity.comment.dto.CommentResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareDetailResponse;
import com.ssafy.dreamong.domain.entity.dream.dto.SquareGetResponseDto;
import com.ssafy.dreamong.domain.entity.dream.repository.DreamRepository;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    //꿈 광장 조회
    public Page<SquareGetResponseDto> getAllSharedDreams(int page, int size, String sort) {
        // Sort 파라미터를 나누어 정렬 기준과 순서를 설정
        String[] sortParams = sort.split(",");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]));

        // Repository를 통해 페이징된 결과 조회
        Page<Dream> sharedDreams = dreamRepository.findByIsSharedTrue(pageable);

        // 결과를 SquareGetResponse로 매핑하여 반환
        return sharedDreams.map(dream -> new SquareGetResponseDto(dream.getId(), dream.getUserId(), dream.getImage()));
    }

    //꿈 광장 상세 조회
    public SquareDetailResponse getDreamDetail(Integer dreamId, Integer userId) {
        Dream dream = dreamRepository.findById(dreamId)
                .filter(d -> d.isShared())
                .orElseThrow(() -> new IllegalArgumentException("Invalid dream or user ID"));

        List<CommentResponse> comments = dream.getComments().stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getLikesCount(),
                        comment.getUser().getNickname())) // 닉네임 포함
                .collect(Collectors.toList());

        boolean likeByUser = commentLikeRepository.existsByCommentAndUser(dream, userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Invalid user Id")));

        return new SquareDetailResponse(dream.getSummary(), dream.getContent(), comments, likeByUser);
    }
}

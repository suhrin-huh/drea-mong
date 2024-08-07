package com.ssafy.dreamong.domain.entity.user.service;

import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.dto.UserInfoResponse;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    public UserInfoResponse getUserInfo(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return new UserInfoResponse(user.getId(), user.getEmail(), user.getNickname(), user.getRole());
    }

    @Transactional
    public void clearRefreshToken(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        user.updateRefreshToken(null);
    }
}

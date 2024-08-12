package com.ssafy.dreamong.domain.entity.user.controller;

import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.jwt.JWTUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    // 리프레시 토큰을 사용하여 액세스 토큰을 재발급
    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshAccessToken(@CookieValue("RefreshToken") String refreshToken, HttpServletResponse response) {
        log.info("================ RefreshToken 재발급  =====================");

        log.info("Refresh token: {} ", refreshToken);
        log.info("Response: {} ", response.getStatus());

        if (refreshToken == null || jwtUtil.isExpired(refreshToken)) {
            log.info("Refresh token is null or expired");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String providerUserId = jwtUtil.getProviderUserId(refreshToken);
        User user = userRepository.findByProviderUserId(providerUserId);

        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            log.info("User not found or refresh token does not match");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = jwtUtil.createAccessToken(user.getId(), providerUserId, user.getRole(), 60 * 60 * 1000L); // 1시간

//        String accessToken = jwtUtil.createAccessToken(providerUserId, user.getRole(), 60 * 60 * 1000L); // 1시간
        response.setHeader("Authorization", "Bearer " + accessToken);
        log.info("Access token generated and set in header");

        return ResponseEntity.ok().build();
    }
}

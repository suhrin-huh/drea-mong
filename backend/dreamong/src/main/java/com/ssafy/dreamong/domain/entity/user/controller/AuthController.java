package com.ssafy.dreamong.domain.entity.user.controller;

import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.jwt.JWTUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

        String accessToken = jwtUtil.createAccessToken(providerUserId, user.getRole(), 60 * 60 * 1000L); // 1시간

//        String accessToken = jwtUtil.createAccessToken(providerUserId, user.getRole(), 60 * 60 * 1000L); // 1시간
        response.setHeader("Authorization", "Bearer " + accessToken);
        log.info("Access token generated and set in header");

        return ResponseEntity.ok().build();
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "RefreshToken", required = false) String refreshToken,
                                       @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                       HttpServletResponse response) {
        log.info("로그아웃 요청 - Refresh token: {}", refreshToken);
        log.info("로그아웃 요청 - Authorization header: {}", authorizationHeader);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = authorizationHeader.substring(7);

        // 리프레시 토큰 검증 및 삭제
        if (refreshToken != null && !jwtUtil.isExpired(refreshToken)) {
            String providerUserId = jwtUtil.getProviderUserId(refreshToken);
            User user = userRepository.findByProviderUserId(providerUserId);
            if (user != null) {
                // 사용자 엔티티의 리프레시 토큰 필드를 null로 설정
                user.updateRefreshToken(refreshToken);
                userRepository.save(user);
            }
        }

        // 액세스 토큰 블랙리스트에 추가 (옵션)
//        if (!jwtUtil.isExpired(accessToken)) {
//            long expiration = jwtUtil.getExpiration(accessToken).getTime() - System.currentTimeMillis();
//            tokenBlacklistService.addToBlacklist(accessToken, expiration);
//        }

        // RefreshToken 쿠키 삭제
        Cookie cookie = new Cookie("RefreshToken", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile/nickname")
    public ResponseEntity<Void> updateNickname(@RequestBody String newNickname) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByProviderUserId(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        user.updateNickname(newNickname);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}

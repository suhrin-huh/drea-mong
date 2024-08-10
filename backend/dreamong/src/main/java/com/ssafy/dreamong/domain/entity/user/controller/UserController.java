package com.ssafy.dreamong.domain.entity.user.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.user.dto.UpdateNicknameRequest;
import com.ssafy.dreamong.domain.entity.user.dto.UserInfoResponse;
import com.ssafy.dreamong.domain.entity.user.service.UserService;
import com.ssafy.dreamong.domain.oauth.dto.CustomOAuth2User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("users/")
@Slf4j
@Tag(name = "User", description = "사용자 API")
public class UserController {
    private final UserService userService;

    @Operation(summary = "사용자 정보 조회", description = "현재 로그인된 사용자의 정보를 조회합니다.")
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getUserInfo(@AuthenticationPrincipal CustomOAuth2User oAuth2User) {
        log.info("사용자 pk: {}: ", oAuth2User.getUserId());
        log.info("{}: ", oAuth2User.getUserId());
        UserInfoResponse userInfoResponse = userService.getUserInfo(oAuth2User.getUserId());
        log.info("userInfoResponse: {}", userInfoResponse);
        return new ResponseEntity<>(ApiResponse.success(userInfoResponse), HttpStatus.OK);
    }

    @Operation(summary = "로그아웃", description = "현재 로그인된 사용자를 로그아웃합니다.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal CustomOAuth2User oAuth2User, HttpServletResponse response
            , HttpServletRequest request) {
        log.info("헤더: {}", request.getHeader("Authorization"));
        log.info("로그아웃 요청  사용자PK : {}: ", oAuth2User.getUserId());
        Integer userId = oAuth2User.getUserId();

        // User의 RefreshToken 제거
        userService.clearRefreshToken(userId);

        // RefreshToken 쿠키 삭제
        Cookie cookie = new Cookie("RefreshToken", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        response.addCookie(cookie);

        log.info("Refresh token cookie deleted and user logged out: {}", userId);

        return new ResponseEntity<>(ApiResponse.success(), HttpStatus.OK);
    }

    @Operation(summary = "닉네임 변경", description = "사용자의 닉네임을 변경합니다.")
    @PatchMapping("/nickname")
    public ResponseEntity<ApiResponse<Void>> updateNickname(@AuthenticationPrincipal CustomOAuth2User oAuth2User,
                                                            @RequestBody UpdateNicknameRequest updateNicknameRequest) {
        Integer userId = oAuth2User.getUserId();
        log.info("requestBody: {}", updateNicknameRequest.getNickname());
        userService.updateNickname(userId, updateNicknameRequest.getNickname());

        return new ResponseEntity<>(ApiResponse.success(), HttpStatus.OK);
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<ApiResponse<Void>> updateFcmToken(@AuthenticationPrincipal CustomOAuth2User oAuth2User, @RequestParam String fcmToken) {
        Integer userId = oAuth2User.getUserId();
        userService.updateUserFcmToken(userId, fcmToken);
        return new ResponseEntity<>(ApiResponse.success(), HttpStatus.OK);
    }

    @PostMapping("/schedule-sleep-reminder")
    public ResponseEntity<ApiResponse<Void>> scheduleSleepReminder(@AuthenticationPrincipal CustomOAuth2User oAuth2User,
                                                                   @RequestParam LocalDateTime bedtime) {
        userService.scheduleSleepReminder(oAuth2User.getUserId(), bedtime);
        return new ResponseEntity<>(ApiResponse.success(), HttpStatus.OK);
    }

    @PostMapping("/schedule-morning-wakeup")
    public ResponseEntity<ApiResponse<Void>> scheduleMorningWakeup(@AuthenticationPrincipal CustomOAuth2User oAuth2User,
                                                                   @RequestParam LocalDateTime wakeupTime) {

        userService.scheduleMorningWakeup(oAuth2User.getUserId(), wakeupTime);
        return new ResponseEntity<>(ApiResponse.success(), HttpStatus.OK);
    }

}

package com.ssafy.dreamong.domain.oauth;

import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.oauth.dto.CustomOAuth2User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.jwt.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        log.info("Authentication successful. Redirecting to callback.");

        //OAuth2User
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();

        String providerUserId = customUserDetails.getProviderUserId();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = authorities.iterator().next().getAuthority();

        String refreshToken = jwtUtil.createRefreshToken(providerUserId, 7 * 24 * 60 * 60 * 1000L); // 1주일

        // 데이터베이스에 리프레시 토큰 저장
        User findUser = userRepository.findByProviderUserId(providerUserId);
        if (findUser != null) {
            findUser.updateRefreshToken(refreshToken);
            userRepository.save(findUser);
        }

        response.addCookie(createCookie("RefreshToken", refreshToken));

        log.info("Cookie Set and Redirecting to callback.");

        // 리디렉션 경로 설정
        response.sendRedirect("https://i11c106.p.ssafy.io/callback");

//        response.sendRedirect("https://localhost:5173/oauth/callback");
//        response.sendRedirect("https://i11c106.p.ssafy.io/oauth/callback");
//        response.sendRedirect("http://localhost:3000/login-success");

    }

    private Cookie createCookie(String key, String value) {

        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(7 * 24 * 60 * 60);
        cookie.setSecure(true); // HTTPS (SSL) 에서만 쿠키 사용가능하도록
        cookie.setPath("/");
        cookie.setHttpOnly(true); // 자바스크립트에서 쿠키값을 읽어가지 못하도록 설정


        log.info("cookie: {}", cookie);

        return cookie;
    }
}
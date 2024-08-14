package com.ssafy.dreamong.domain.jwt;

import com.ssafy.dreamong.domain.entity.user.Role;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.dto.UserDto;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.oauth.dto.CustomOAuth2User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * HttpServletRequest에서 "Authorization" 헤더를 가져옴.
     * "Authorization" 헤더가 존재하고 "Bearer "로 시작하면, 해당 문자열을 제거하고 순수 토큰 값을 추출.
     * 액세스 토큰이 만료된 경우, 쿠키에서 "RefreshToken"을 가져옴.
     * 리프레시 토큰이 존재하고 유효하면, 리프레시 토큰에서 사용자명을 추출하고 데이터베이스에서 사용자를 조회.
     * 조회된 사용자가 존재하면, 새로운 액세스 토큰을 생성하여 응답 헤더에 추가.
     * 리프레시 토큰도 만료된 경우, 응답 상태를 401로 설정하고 에러 메시지를 전송.
     * 유효한 토큰이 있으면, 해당 토큰을 사용하여 인증을 처리.
     * 필터 체인을 따라 요청을 계속 처리.
     */

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 현재 요청의 URI를 가져옴
        String requestUri = request.getRequestURI();
        log.info("requestUri: {}", request.getRequestURI());

        // 특정 경로에 대한 예외 처리: 로그인페이지, OAuth2(소셜 로그인), auth/refresh(엑세스 토큰 발급) 경로의 요청은 필터링을 건너뜀
        if (requestUri.matches("^\\/login(?:\\/.*)?$") || requestUri.matches("^\\/oauth2(?:\\/.*)?$") || requestUri.matches("^\\/auth\\/refresh(?:\\/.*)?$")) {
            log.info("login, oauth2, refresh: rqeustURI: {}", requestUri);
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 헤더에서 액세스 토큰을 가져옴
        String accessToken = request.getHeader("Authorization");
        log.info("request: {}", request);
        log.info("Authorization header: {}", accessToken);


        // 액세스 토큰이 존재하고, "Bearer "로 시작하는 경우
        if (accessToken != null && accessToken.startsWith("Bearer ")) {

            // "Bearer " 부분을 제거하고 실제 토큰 값만 추출
            accessToken = accessToken.substring(7);

            // 액세스 토큰이 만료되었는지 확인
            if (jwtUtil.isExpired(accessToken)) {
                log.info("Access token expired");

                // 만료된 경우, 쿠키에서 리프레시 토큰을 가져옴
                Cookie[] cookies = request.getCookies();
                String refreshToken = null;

                if (cookies != null) {
                    // 모든 쿠키를 순회하며 "RefreshToken" 쿠키를 찾음
                    for (Cookie cookie : cookies) {
                        if ("RefreshToken".equals(cookie.getName())) {
                            refreshToken = cookie.getValue();
                        }
                    }
                }

                // 리프레시 토큰이 존재하는 경우
                if (refreshToken != null) {
                    log.info("Refresh token found: {}", refreshToken);

                    // 리프레시 토큰이 만료되지 않은 경우
                    if (!jwtUtil.isExpired(refreshToken)) {

                        // 리프레시 토큰에서 providerUserId를 추출
                        String providerUserId = jwtUtil.getProviderUserId(refreshToken);

                        // 데이터베이스에서 해당 사용자를 조회
                        User findUser = userRepository.findByProviderUserId(providerUserId);

                        // 사용자가 존재하고, 리프레시 토큰이 일치하는 경우
                        if (findUser != null && refreshToken.equals(findUser.getRefreshToken())) {

                            // 새로운 액세스 토큰을 생성하고 응답 헤더에 추가
                            String newAccessToken = jwtUtil.createAccessToken(findUser.getId(), providerUserId, findUser.getRole());
                            response.setHeader("Authorization", "Bearer " + newAccessToken);
                            log.info("New access token created: {}", newAccessToken);

                            // 새로운 액세스 토큰을 사용하여 인증 수행
                            accessToken = newAccessToken;
                        }
                    } else {
                        // 리프레시 토큰도 만료된 경우 처리
                        log.info("Refresh token expired");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Refresh token expired. Please login again.");
                        return;
                    }
                } else {
                    // 리프레시 토큰이 존재하지 않는 경우 처리
                    log.info("Refresh token not found");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Refresh token not found. Please login again.");
                    return;
                }
            }


            // 액세스 토큰이 만료되지 않은 경우
            if (!jwtUtil.isExpired(accessToken)) {
                // 액세스 토큰에서 사용자 ID, providerUserId, 역할(role)을 추출
                Integer userId = jwtUtil.getUserId(accessToken);
                String providerUserId = jwtUtil.getProviderUserId(accessToken);
                String role = jwtUtil.getRole(accessToken);

                // 추출한 정보로 UserDto 객체를 생성
                UserDto userDto = new UserDto();
                userDto.setUserId(userId);
                userDto.setProviderUserId(providerUserId);
                userDto.setRole(role.equals("MEMBER") ? Role.MEMBER : Role.ADMIN);

                // UserDto를 기반으로 CustomOAuth2User 객체를 생성
                CustomOAuth2User customOAuth2User = new CustomOAuth2User(userDto);

                // CustomOAuth2User 객체를 사용해 Authentication 객체 생성
                Authentication authToken = new UsernamePasswordAuthenticationToken(customOAuth2User, null, customOAuth2User.getAuthorities());

                // SecurityContextHolder에 인증 객체를 설정
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 필터 체인의 다음 필터로 요청을 전달하여 계속 처리
        filterChain.doFilter(request, response);
    }
}
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

        String requestUri = request.getRequestURI();

        // 예외 처리 경로 설정
        if (requestUri.matches("^\\/login(?:\\/.*)?$") || requestUri.matches("^\\/oauth2(?:\\/.*)?$") || requestUri.matches("^\\/auth\\/refresh(?:\\/.*)?$")) {
            log.debug("login,oauth2,api: rqeustURI: {}", requestUri);
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = request.getHeader("Authorization");
        log.info("request: {}", request);
        log.info("Authorization header: {}", accessToken);


        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);

            if (jwtUtil.isExpired(accessToken)) {
                log.info("Access token expired");

                Cookie[] cookies = request.getCookies();
                String refreshToken = null;

                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("RefreshToken".equals(cookie.getName())) {
                            refreshToken = cookie.getValue();
                        }
                    }
                }

                if (refreshToken != null) {
                    log.info("Refresh token found: {}", refreshToken);

                    if (!jwtUtil.isExpired(refreshToken)) {
                        String providerUserId = jwtUtil.getProviderUserId(refreshToken);
                        User findUser = userRepository.findByProviderUserId(providerUserId);
                        if (findUser != null && refreshToken.equals(findUser.getRefreshToken())) {
                            String newAccessToken = jwtUtil.createAccessToken(findUser.getId(), providerUserId, findUser.getRole(), 60 * 60 * 1000L);
                            response.setHeader("Authorization", "Bearer " + newAccessToken);
                            log.info("New access token created: {}", newAccessToken);
                            accessToken = newAccessToken;
                        }
                    } else {
                        // 리프레시 토큰도 만료된 경우 처리
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Refresh token expired. Please login again.");
                        return;
                    }
                } else {
                    // 리프레시 토큰이 존재하지 않는 경우 처리
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Refresh token not found. Please login again.");
                    return;
                }
            }

            if (!jwtUtil.isExpired(accessToken)) {
                Integer userId = jwtUtil.getUserId(accessToken);
                String providerUserId = jwtUtil.getProviderUserId(accessToken);
                String role = jwtUtil.getRole(accessToken);
                UserDto userDto = new UserDto();

                userDto.setUserId(userId);
                userDto.setProviderUserId(providerUserId);
                userDto.setRole(role.equals("MEMBER") ? Role.MEMBER : Role.ADMIN);

                CustomOAuth2User customOAuth2User = new CustomOAuth2User(userDto);
                Authentication authToken = new UsernamePasswordAuthenticationToken(customOAuth2User, null, customOAuth2User.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
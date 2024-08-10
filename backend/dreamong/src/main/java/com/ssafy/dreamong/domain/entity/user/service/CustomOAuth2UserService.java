package com.ssafy.dreamong.domain.entity.user.service;


import com.ssafy.dreamong.domain.entity.user.Role;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.dto.UserDto;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.oauth.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        OAuth2Response oAuth2Response = getOAuth2Response(userRequest.getClientRegistration().getRegistrationId(), oAuth2User.getAttributes());

        log.info("OAuth2User: {}", oAuth2User);
        log.info("OAuth2Response: {}", oAuth2Response);

//        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        //리소스 서버에서 발급 받은 정보로 사용자를 특정할 아이디값을 만듬
        String providerUserId = oAuth2Response.getProvider() + " " + oAuth2Response.getProviderId();
        User findUser = userRepository.findByProviderUserId(providerUserId);

        if (findUser == null) { // 우리 서비스에 처음 로그인한 경우
            User user = User.createUser(oAuth2Response.getEmail(), oAuth2Response.getName(), providerUserId);
            userRepository.save(user); // 첫 번째 save: User를 저장하여 ID를 할당받음

            String defaultNickname = "dreamer_" + user.getId(); // ID를 활용해 닉네임을 업데이트
            user.updateNickname(defaultNickname);
            userRepository.save(user);

            UserDto userDto = new UserDto();
            userDto.setUserId(user.getId());
            userDto.setProviderUserId(providerUserId);
            userDto.setName(oAuth2Response.getName());
            userDto.setRole(Role.MEMBER);
            userDto.setNickname(defaultNickname);

            return new CustomOAuth2User(userDto);
        } else { // 이전에 로그인한 기록이 있는 경우
            findUser.updateUserInfo(oAuth2Response.getEmail(), oAuth2Response.getName());
            userRepository.save(findUser);


            UserDto userDto = new UserDto();
            userDto.setUserId(findUser.getId());
            userDto.setProviderUserId(findUser.getProviderUserId());
            userDto.setName(oAuth2Response.getName());
            userDto.setRole(findUser.getRole());
            userDto.setNickname(findUser.getNickname());

            return new CustomOAuth2User(userDto);
        }
    }

    private OAuth2Response getOAuth2Response(String registrationId, Map<String, Object> attributes) {
        switch (registrationId) {
            case "naver":
                return new NaverResponse(attributes);
            case "google":
                return new GoogleResponse(attributes);
            case "kakao":
                return new KakaoResponse(attributes);
            default:
                throw new OAuth2AuthenticationException("Unknown registration id: " + registrationId);
        }
    }
}
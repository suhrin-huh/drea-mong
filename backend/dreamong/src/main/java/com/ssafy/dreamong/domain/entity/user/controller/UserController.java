package com.ssafy.dreamong.domain.entity.user.controller;

import com.ssafy.dreamong.domain.entity.user.service.CustomOAuth2UserService;
import com.ssafy.dreamong.domain.entity.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserService userService;
}

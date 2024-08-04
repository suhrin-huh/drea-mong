package com.ssafy.dreamong.domain.entity.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

    private String role;
    private String name;
    private String providerUserId;
    private String nickname;
}
package com.ssafy.dreamong.domain.entity.user.dto;

import com.ssafy.dreamong.domain.entity.user.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {

    private Integer userId;
    private Role role;
    private String name;
    private String providerUserId;
    private String nickname;
}
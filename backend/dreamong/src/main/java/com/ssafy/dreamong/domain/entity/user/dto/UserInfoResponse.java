package com.ssafy.dreamong.domain.entity.user.dto;

import com.ssafy.dreamong.domain.entity.user.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserInfoResponse {
    private Integer userId;
    private String email;
    private String nickname;
    private Role role;

}

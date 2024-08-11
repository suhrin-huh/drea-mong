package com.ssafy.dreamong.domain.entity.room.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomDetailsResponse {
    private Integer roomId;
    private String title;
    private String youtubeLink;
    private String thumbnail;
    private int participantCount; // 참여자 수 필드 추가
}

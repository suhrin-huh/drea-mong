package com.ssafy.dreamong.domain.entity.room.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomCreateRequest {
    private String title;
    private String youtubeLink;
    private String thumbnail;
}
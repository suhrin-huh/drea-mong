package com.ssafy.dreamong.domain.entity.room;

import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dream_id")
    private Integer id;
    @Column(name = "title")
    private String title;
    @Column(name = "youtube_link")
    private String youtubeLink;

    @Builder
    public Room(Integer id, String title, String youtubeLink) {
        this.id = id;
        this.title = title;
        this.youtubeLink = youtubeLink;
    }
}

package com.ssafy.dreamong.domain.entity.dream;

import com.ssafy.dreamong.domain.entity.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "dream")
public class Dream extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String content;
    private String image;
    private String interpretation;
    private String summary;
    private boolean isShared;
    private Integer likesCount;

    private Integer userId;

}

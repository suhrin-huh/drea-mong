package com.ssafy.dreamong.domain.entity.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(name = "My", description = "마이 페이지 API")
public class MyController {

    @Operation(summary = "마이 엔드포인트", description = "마이 엔드포인트를 호출합니다.")
    @GetMapping("/my")
    public String myAPI() {
        log.info("{} , my Controller Connect", this);
        return "my route";
    }
}

package com.ssafy.dreamong.domain.entity.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@Tag(name = "Main", description = "메인 API")
public class MainController {

    @Operation(summary = "메인 엔드포인트", description = "메인 엔드포인트를 호출하여 메인 화면을 표시합니다.")
    @GetMapping("/")
    public String mainAPI() {
        log.info("{} , main Controller Connect", this);
        return "main route";
    }
}

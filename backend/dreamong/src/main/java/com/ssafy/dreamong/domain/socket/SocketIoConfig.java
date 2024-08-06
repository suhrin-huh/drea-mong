package com.ssafy.dreamong.domain.socket;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class SocketIoConfig {

    @Value("${socketio.server.hostname}")
    private String hostname;

    @Value("${socketio.server.port}")
    private int port;

    /**
     * Tomcat 서버와 별도로 돌아가는 netty 서버를 생성
     */
    @Bean
    public SocketIOServer socketIoServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(hostname);
        config.setPort(port);
        log.info("socketio server started at {}:{}", hostname, port);

        // Netty 설정 추가
        config.setBossThreads(1); // Boss 스레드는 새로운 연결을 수락하고 기존 연결의 트래픽을 분배
        config.setWorkerThreads(4); //Worker 스레드는 실제로 데이터를 읽고 쓰는 작업을 수행
        config.setAllowCustomRequests(true); // 커스텀 HTTP 요청을 처리 가능
        config.setUpgradeTimeout(10000); // milliseconds
        config.setPingInterval(25000); // milliseconds
        config.setPingTimeout(60000); // 이 시간 내에 응답이 없으면 연결이 끊어짐
        return new SocketIOServer(config);
    }
}
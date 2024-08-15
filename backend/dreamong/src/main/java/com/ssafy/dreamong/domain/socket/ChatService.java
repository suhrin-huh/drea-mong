package com.ssafy.dreamong.domain.socket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CHAT_HISTORY_KEY_PREFIX = "chat_history:";

    @Autowired
    public ChatService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveMessage(String roomId, ChatMessage message) {
        String key = CHAT_HISTORY_KEY_PREFIX + roomId;
        redisTemplate.opsForList().rightPush(key, message);
        // 예시로, 저장된 메시지가 너무 많다면 오래된 메시지를 삭제하는 로직 추가 가능
        redisTemplate.opsForList().trim(key, -100, -1); // 최근 100개의 메시지만 유지
    }

    public List<Object> getMessages(String roomId) {
        String key = CHAT_HISTORY_KEY_PREFIX + roomId;
        return redisTemplate.opsForList().range(key, 0, -1); // 모든 메시지 조회
    }
}
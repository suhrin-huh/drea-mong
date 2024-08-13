package com.ssafy.dreamong.domain.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.ssafy.dreamong.domain.entity.room.dto.RoomDetailsResponse;
import com.ssafy.dreamong.domain.entity.room.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SocketIOEventHandler {

    private final SocketIOServer server;
    private final RoomService roomService;

    @Autowired
    public SocketIOEventHandler(SocketIOServer server, RoomService roomService) {
        this.server = server;
        this.roomService = roomService;

        init();
    }

    private void init() {
        server.addConnectListener(client -> System.out.println("Client connected: " + client.getSessionId()));

        server.addDisconnectListener(client -> System.out.println("Client disconnected: " + client.getSessionId()));

        server.addEventListener("join-room", String.class, (client, roomId, ackRequest) -> {
            log.info("Received join-room event for room: {}", roomId);

            RoomDetailsResponse room = roomService.getRoomDetailsById(Integer.parseInt(roomId));
            if (room == null) {
                log.info("Room not found: {}", roomId);
                client.sendEvent("error", "Room not found");
                return;
            }

            client.joinRoom(roomId);
            int participantCount = getParticipantCount(roomId);
            server.getRoomOperations(roomId).sendEvent("participant-count-update", participantCount);
            log.info("Client joined room: {}, participant count: {}", roomId, participantCount);
        });

        server.addEventListener("chat-message", ChatMessage.class, (client, data, ackRequest) -> {
            log.info("Received chat-message event: {}", data.getMessage());
            server.getRoomOperations(data.getRoomId()).sendEvent("chat-message", data);
        });

        server.addEventListener("leave-room", String.class, (client, roomId, ackRequest) -> {
            log.info("Received leave-room event for room: {}", roomId);
            client.leaveRoom(roomId);
            int participantCount = getParticipantCount(roomId);
            server.getRoomOperations(roomId).sendEvent("participant-count-update", participantCount);
            log.info("Client left room: {}, participant count: {}", roomId, participantCount);
        });


        server.addEventListener("force-leave", String.class, (client, roomId, ackRequest) -> {
            log.info("Received force-leave event for room: {}", roomId);
            server.getRoomOperations(roomId).sendEvent("force-leave", roomId);
        });
    }

    private int getParticipantCount(String roomId) {
        log.info("Get participant count for room: {} , participant count: {}", roomId, server.getRoomOperations(roomId).getClients().size());
        return server.getRoomOperations(roomId).getClients().size();
    }
}
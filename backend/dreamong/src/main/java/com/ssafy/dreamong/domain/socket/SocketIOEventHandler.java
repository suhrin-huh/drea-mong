package com.ssafy.dreamong.domain.socket;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SocketIOEventHandler {

    private final SocketIOServer server;

    @Autowired
    public SocketIOEventHandler(SocketIOServer server) {
        this.server = server;
        init();
    }

    private void init() {
        server.addConnectListener(new ConnectListener() {
            @Override
            public void onConnect(SocketIOClient client) {
                System.out.println("Client connected: " + client.getSessionId());
            }
        });

        server.addDisconnectListener(new DisconnectListener() {
            @Override
            public void onDisconnect(SocketIOClient client) {
                System.out.println("Client disconnected: " + client.getSessionId());
            }
        });

        server.addEventListener("join-room", String.class, new DataListener<String>() {
            @Override
            public void onData(SocketIOClient client, String roomId, AckRequest ackRequest) {
                client.joinRoom(roomId);
                server.getRoomOperations(roomId).sendEvent("participant-count-update", getParticipantCount(roomId));
            }
        });

        server.addEventListener("chat-message", ChatMessage.class, new DataListener<ChatMessage>() {
            @Override
            public void onData(SocketIOClient client, ChatMessage data, AckRequest ackRequest) {
                server.getRoomOperations(data.getRoomId()).sendEvent("chat-message", data);
            }
        });
    }

    private int getParticipantCount(String roomId) {
        return server.getRoomOperations(roomId).getClients().size();
    }
}
package com.ssafy.dreamong.domain.entity.room.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.ssafy.dreamong.domain.entity.room.Room;
import com.ssafy.dreamong.domain.entity.room.repository.RoomRepository;
import com.ssafy.dreamong.domain.exception.RoomNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final SocketIOServer socketIOServer;

    public Room createRoom(Room room) {
        Room createdRoom = roomRepository.save(room);
        socketIOServer.getBroadcastOperations().sendEvent("room-created", createdRoom);
        return createdRoom;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Integer id) {
        return roomRepository.findById(id).orElseThrow(RoomNotFoundException::new);
    }

    public void deleteRoom(Integer romeId) {
            Room room = roomRepository.findById(romeId).orElseThrow(RoomNotFoundException::new);
            String roomIdToString = room.getId().toString();
            socketIOServer.getRoomOperations(roomIdToString).sendEvent("force-leave", "Room has been deleted. Please leave the room.");
            socketIOServer.getRoomOperations(roomIdToString).getClients().forEach(client -> client.leaveRoom(roomIdToString));
            roomRepository.deleteById(romeId);
            socketIOServer.getBroadcastOperations().sendEvent("room-deleted", romeId);
    }
}


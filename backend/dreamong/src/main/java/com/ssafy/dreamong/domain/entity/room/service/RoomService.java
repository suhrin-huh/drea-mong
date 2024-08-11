package com.ssafy.dreamong.domain.entity.room.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.ssafy.dreamong.domain.entity.room.Room;
import com.ssafy.dreamong.domain.entity.room.dto.RoomCreateRequest;
import com.ssafy.dreamong.domain.entity.room.dto.RoomListResponse;
import com.ssafy.dreamong.domain.entity.room.repository.RoomRepository;
import com.ssafy.dreamong.domain.entity.user.User;
import com.ssafy.dreamong.domain.entity.user.repository.UserRepository;
import com.ssafy.dreamong.domain.exception.RoomNotFoundException;
import com.ssafy.dreamong.domain.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final SocketIOServer socketIOServer;

    public void createRoom(Integer userId, RoomCreateRequest roomCreateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Room room = Room.builder()
                .title(roomCreateRequest.getTitle())
                .youtubeLink(roomCreateRequest.getYoutubeLink())
                .thumbnail(roomCreateRequest.getThumbnail())
                .user(user)
                .build();

        Room createdRoom = roomRepository.save(room);
        socketIOServer.getBroadcastOperations().sendEvent("room-created", createdRoom);
    }

    public List<RoomListResponse> getAllRooms() {
        return roomRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToRoomListResponse)
                .collect(Collectors.toList());
    }

    public Room getRoomById(Integer id) {
        return roomRepository.findById(id).orElseThrow(RoomNotFoundException::new);
    }

    public void deleteRoom(Integer romeId) {
        Room room = roomRepository.findById(romeId).orElseThrow(RoomNotFoundException::new);
        log.info("Deleting room: {}", romeId);
        String roomIdToString = room.getId().toString();
        log.info("roomIdToString: {}", roomIdToString);
        socketIOServer.getRoomOperations(roomIdToString).sendEvent("force-leave", "Room has been deleted. Please leave the room.");
        socketIOServer.getRoomOperations(roomIdToString).getClients().forEach(client -> client.leaveRoom(roomIdToString));
        roomRepository.deleteById(romeId);
        socketIOServer.getBroadcastOperations().sendEvent("room-deleted", romeId);
    }

    private RoomListResponse mapToRoomListResponse(Room room) {
        int participantCount = socketIOServer.getRoomOperations(String.valueOf(room.getId())).getClients().size();
        return new RoomListResponse(room.getId(), room.getTitle(), room.getYoutubeLink(), room.getThumbnail(), participantCount);
    }
}


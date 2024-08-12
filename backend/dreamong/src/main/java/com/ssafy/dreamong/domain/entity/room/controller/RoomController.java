package com.ssafy.dreamong.domain.entity.room.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.room.Room;
import com.ssafy.dreamong.domain.entity.room.dto.RoomListResponse;
import com.ssafy.dreamong.domain.entity.room.service.RoomService;
import com.ssafy.dreamong.domain.exception.RoomNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Room>> createRoom(@RequestBody Room room) {
        try {
            Room response = roomService.createRoom(room);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomListResponse>>> getAllRooms() {

        try {
            List<RoomListResponse> allRooms = roomService.getAllRooms();
            if (allRooms.isEmpty()) {
                return new ResponseEntity<>(ApiResponse.success(), HttpStatus.NO_CONTENT);
            }
            return ResponseEntity.ok(ApiResponse.success(allRooms));
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Room>> getRoomById(@PathVariable Integer roomId) {
        try {
            Room findRoom = roomService.getRoomById(roomId);
            return ResponseEntity.ok(ApiResponse.success(findRoom));
        } catch (RoomNotFoundException e) {
            return new ResponseEntity<>(ApiResponse.error(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Integer roomId) {
        try {
            roomService.deleteRoom(roomId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (RoomNotFoundException e) {
            return new ResponseEntity<>(ApiResponse.error(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}

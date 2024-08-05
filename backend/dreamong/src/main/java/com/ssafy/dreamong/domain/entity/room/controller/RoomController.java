package com.ssafy.dreamong.domain.entity.room.controller;

import com.ssafy.dreamong.domain.entity.common.ApiResponse;
import com.ssafy.dreamong.domain.entity.room.Room;
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

    //    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Room>> createRoom(@RequestBody Room room) {
        try {
            Room response = roomService.createRoom(room);
            return ResponseEntity.ok(ApiResponse.success(response, "방 생성 성공"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Room>>> getAllRooms() {

        try {
            List<Room> allRooms = roomService.getAllRooms();
            if (allRooms.isEmpty()) {
                return new ResponseEntity<>(ApiResponse.error("방 목록이 존재하지 않음"), HttpStatus.NO_CONTENT);
            }
            return ResponseEntity.ok(ApiResponse.success(allRooms, "방 목록 조회 성공"));
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error("방 목록 조회 중 오류 발생"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{romeId}")
    public ResponseEntity<ApiResponse<Room>> getRoomById(@PathVariable Integer romeId) {
        try {
            Room findRoom = roomService.getRoomById(romeId);
            return ResponseEntity.ok(ApiResponse.success(findRoom, "방 상세 조회 성공"));
        } catch (RoomNotFoundException e) {
            return new ResponseEntity<>(ApiResponse.error("방을 찾을 수 없습니다."), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error("방 조회 중 오류가 발생했습니다."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    //    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{romeId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Integer romeId) {
        try {
            roomService.deleteRoom(romeId);
            return ResponseEntity.ok(ApiResponse.success("방 삭제 성공"));
        } catch (Exception e) {
            return new ResponseEntity<>(ApiResponse.error("방 삭제 중 오류가 발생했습니다."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

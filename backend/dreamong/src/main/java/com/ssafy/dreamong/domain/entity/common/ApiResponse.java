package com.ssafy.dreamong.domain.entity.common;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApiResponse<T> {
    private String status;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .status("success")
                .build();
    }

    public static <T> ApiResponse<T> error() {
        return ApiResponse.<T>builder()
                .status("error")
                .build();
    }

    public static <T> ApiResponse<T> like() {
        return ApiResponse.<T>builder()
                .status("like")
                .build();
    }

    public static <T> ApiResponse<T> unLike() {
        return ApiResponse.<T>builder()
                .status("unLike")
                .build();
    }
}

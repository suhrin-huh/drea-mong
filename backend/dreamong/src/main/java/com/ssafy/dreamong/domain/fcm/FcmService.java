package com.ssafy.dreamong.domain.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FcmService {

    private static final String LOGO_IMAGE_URL = "https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg";

    @Async
    public void sendNotification(String token, String title, String body) throws Exception {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .setImage(LOGO_IMAGE_URL)
                .build();

        Message message = Message.builder()
                .setToken(token)
                .setNotification(notification)
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        log.info("Successfully sent message: {}", response);
    }
}

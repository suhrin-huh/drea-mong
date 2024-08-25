-- 외래 키 제약 조건을 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 테이블 삭제
DROP TABLE IF EXISTS dream_category;
DROP TABLE IF EXISTS comment_like;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS dream;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS users;

-- 테이블 생성
CREATE TABLE category (
                          category_id INTEGER NOT NULL AUTO_INCREMENT,
                          word VARCHAR(255),
                          type ENUM('character', 'dreamType', 'location', 'mood', 'objects'),
                          PRIMARY KEY (category_id)
) ENGINE=InnoDB;

CREATE TABLE users (
                       user_id INTEGER NOT NULL AUTO_INCREMENT,
                       created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                       last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       email VARCHAR(100) NOT NULL,
                       fcm_token VARCHAR(255),
                       name VARCHAR(255) NOT NULL,
                       nickname VARCHAR(255),
                       provider_user_id VARCHAR(255) NOT NULL,
                       refresh_token VARCHAR(255),
                       role ENUM('ADMIN', 'MEMBER') NOT NULL,
                       PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE dream (
                       dream_id INTEGER NOT NULL AUTO_INCREMENT,
                       is_shared BOOLEAN,
                       user_id INTEGER,
                       created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                       last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       image VARCHAR(255),
                       summary VARCHAR(255) NOT NULL,
                       write_time VARCHAR(255) NOT NULL,
                       content TEXT NOT NULL,
                       interpretation TEXT,
                       PRIMARY KEY (dream_id)
) ENGINE=InnoDB;

CREATE TABLE comment (
                         comment_id INTEGER NOT NULL AUTO_INCREMENT,
                         dream_id INTEGER,
                         likes_count INTEGER,
                         user_id INTEGER,
                         content VARCHAR(255),
                         PRIMARY KEY (comment_id)
) ENGINE=InnoDB;

CREATE TABLE comment_like (
                              comment_id INTEGER,
                              comment_like_id INTEGER NOT NULL AUTO_INCREMENT,
                              user_id INTEGER,
                              PRIMARY KEY (comment_like_id)
) ENGINE=InnoDB;

CREATE TABLE dream_category (
                                category_id INTEGER,
                                dream_category_id INTEGER NOT NULL AUTO_INCREMENT,
                                dream_id INTEGER,
                                PRIMARY KEY (dream_category_id)
) ENGINE=InnoDB;

CREATE TABLE room (
                      room_id INTEGER NOT NULL AUTO_INCREMENT,
                      user_id INTEGER,
                      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                      last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      youtube_link VARCHAR(1000) NOT NULL,
                      thumbnail VARCHAR(255) NOT NULL,
                      title VARCHAR(255) NOT NULL,
                      PRIMARY KEY (room_id)
) ENGINE=InnoDB;

CREATE TABLE notification (
                              id INTEGER NOT NULL AUTO_INCREMENT,
                              sent BOOLEAN,
                              user_id INTEGER,
                              created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                              last_modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              schedule_time DATETIME,
                              notification_type ENUM('MORNING_WAKEUP_REMINDER', 'SLEEP_REMINDER'),
                              PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 외래 키 제약 조건 추가 및 인덱스 생성
ALTER TABLE users
    ADD CONSTRAINT UK_provider_user_id UNIQUE (provider_user_id);

ALTER TABLE dream
    ADD CONSTRAINT FK_dream_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE;

ALTER TABLE comment
    ADD CONSTRAINT FK_comment_dream_id
        FOREIGN KEY (dream_id) REFERENCES dream (dream_id)
            ON DELETE CASCADE,
    ADD CONSTRAINT FK_comment_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE;

ALTER TABLE comment_like
    ADD CONSTRAINT FK_comment_like_comment_id
        FOREIGN KEY (comment_id) REFERENCES comment (comment_id)
            ON DELETE CASCADE,
    ADD CONSTRAINT FK_comment_like_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE;

ALTER TABLE dream_category
    ADD CONSTRAINT FK_dream_category_category_id
        FOREIGN KEY (category_id) REFERENCES category (category_id),
    ADD CONSTRAINT FK_dream_category_dream_id
        FOREIGN KEY (dream_id) REFERENCES dream (dream_id)
        ON DELETE CASCADE;

ALTER TABLE notification
    ADD CONSTRAINT FK_notification_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE room
    ADD CONSTRAINT FK_room_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);

-- 외래 키 제약 조건을 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;

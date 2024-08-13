-- `IF EXISTS`는 MySQL의 `DROP FOREIGN KEY`에서 지원되지 않으므로 제거되었습니다.

-- 외래 키 제약 조건을 비활성화합니다.
SET FOREIGN_KEY_CHECKS = 0;

-- 테이블 삭제
DROP TABLE IF EXISTS dream_category;
DROP TABLE IF EXISTS comment_like;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Room;
DROP TABLE IF EXISTS dream;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS users;

-- 외래 키 제약 조건을 다시 활성화합니다.
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE category (
                          category_id INTEGER NOT NULL AUTO_INCREMENT,
                          word VARCHAR(255),
                          type ENUM('character', 'dreamType', 'location', 'mood', 'objects'),
                          PRIMARY KEY (category_id)
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

CREATE TABLE dream (
                       dream_id INTEGER NOT NULL AUTO_INCREMENT,
                       is_shared BOOLEAN,
                       user_id INTEGER,
                       createdDate DATETIME(6),
                       lastModifiedDate DATETIME(6),
                       image VARCHAR(255),
                       summary VARCHAR(255) NOT NULL,
                       write_time VARCHAR(255) NOT NULL,
                       content TEXT NOT NULL,
                       interpretation TEXT,
                       PRIMARY KEY (dream_id)
) ENGINE=InnoDB;

CREATE TABLE dream_category (
                                category_id INTEGER,
                                dream_category_id INTEGER NOT NULL AUTO_INCREMENT,
                                dream_id INTEGER,
                                PRIMARY KEY (dream_category_id)
) ENGINE=InnoDB;

CREATE TABLE Notification (
                              id INTEGER NOT NULL AUTO_INCREMENT,
                              sent BOOLEAN,
                              user_id INTEGER,
                              createdDate DATETIME(6),
                              lastModifiedDate DATETIME(6),
                              scheduleTime DATETIME(6),
                              notificationType ENUM('MORNING_WAKEUP_REMINDER', 'SLEEP_REMINDER'),
                              PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE Room (
                      room_id INTEGER NOT NULL AUTO_INCREMENT,
                      user_id INTEGER,
                      createdDate DATETIME(6),
                      lastModifiedDate DATETIME(6),
                      youtube_link VARCHAR(1000) NOT NULL,
                      thumbnail VARCHAR(255) NOT NULL,
                      title VARCHAR(255) NOT NULL,
                      PRIMARY KEY (room_id)
) ENGINE=InnoDB;

CREATE TABLE users (
                       user_id INTEGER NOT NULL AUTO_INCREMENT,
                       createdDate DATETIME(6),
                       lastModifiedDate DATETIME(6),
                       email VARCHAR(255) NOT NULL,
                       fcm_token VARCHAR(255),
                       name VARCHAR(255) NOT NULL,
                       nickname VARCHAR(255),
                       provider_user_id VARCHAR(255) NOT NULL,
                       refresh_token VARCHAR(255),
                       role ENUM('ADMIN', 'MEMBER') NOT NULL,
                       PRIMARY KEY (user_id)
) ENGINE=InnoDB;

ALTER TABLE users
    ADD CONSTRAINT UK_provider_user_id UNIQUE (provider_user_id);

ALTER TABLE comment
    ADD CONSTRAINT FK_comment_dream_id
        FOREIGN KEY (dream_id) REFERENCES dream (dream_id);

ALTER TABLE comment
    ADD CONSTRAINT FK_comment_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE comment_like
    ADD CONSTRAINT FK_comment_like_comment_id
        FOREIGN KEY (comment_id) REFERENCES comment (comment_id);

ALTER TABLE comment_like
    ADD CONSTRAINT FK_comment_like_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE dream_category
    ADD CONSTRAINT FK_dream_category_category_id
        FOREIGN KEY (category_id) REFERENCES category (category_id);

ALTER TABLE dream_category
    ADD CONSTRAINT FK_dream_category_dream_id
        FOREIGN KEY (dream_id) REFERENCES dream (dream_id);

ALTER TABLE Notification
    ADD CONSTRAINT FK_notification_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE Room
    ADD CONSTRAINT FK_room_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id);


-- Insert sample data
-- users 테이블에 데이터 삽입
INSERT INTO users (`user_id`, `createdDate`, `lastModifiedDate`, `email`, `fcm_token`, `name`, `nickname`, `provider_user_id`, `refresh_token`, `role`)
VALUES
    (1,'2024-08-13 13:47:41.347183','2024-08-13 13:47:41.459741','dreamermong@nate.com',NULL,'이학현','dreamermong_1','kakao 3657315315123','','ADMIN'),
    (2,'2024-08-13 11:39:53.031439','2024-08-13 12:05:52.113285','dreamermong@naver.com',NULL,'김민주','dreamermong_2','kakao 3653150631123','','MEMBER');

-- category 테이블에 데이터 삽입
INSERT INTO category (`category_id`,`word`,`type`)
VALUES
    (1,'일반','dreamType'),
    (2,'날개 달린 존재','character'),
    (3,'평화로움','mood'),
    (4,'구름','location'),
    (5,'바다','location'),
    (6,'놀라움','mood'),
    (7,'날개','objects'),
    (8,'도시','location'),
    (9,'자유로움','mood'),
    (10,'하늘','location'),
    (11,'산','location'),
    (12,'호기심','mood'),
    (13,'미래의 나','character'),
    (14,'탈것','objects'),
    (15,'로봇','character'),
    (16,'기계','objects'),
    (17,'미래 도시','location'),
    (18,'초고층 빌딩','objects'),
    (19,'설렘','mood'),
    (20,'숲','location'),
    (21,'고대 사원','location'),
    (22,'기쁨','mood'),
    (23,'신비로운 생명체','character'),
    (24,'마법 꽃','objects'),
    (25,'두려움','mood'),
    (26,'비밀의 정원','location'),
    (27,'폭포','location'),
    (28,'도서관','location'),
    (29,'중세 판타지 세계','location'),
    (30,'우주 전쟁터','location'),
    (31,'책','objects'),
    (32,'용','objects'),
    (33,'기사','objects'),
    (34,'흥미로움','mood'),
    (35,'거울','objects'),
    (36,'거울 속 세계','location'),
    (37,'또 다른 나','character'),
    (38,'자기 발견','mood'),
    (39,'나','character'),
    (40,'성','objects'),
    (41,'성','location'),
    (42,'구름','objects'),
    (43,'도서관','objects'),
    (44,'신비한 생명체','character'),
    (45,'정원','location'),
    (46,'정원','objects'),
    (47,'사람','character'),
    (48,'자동차','objects'),
    (49,'바다 생물','objects'),
    (50,'평화','mood'),
    (51,'왕','character'),
    (52,'아름다움','mood'),
    (53,'산호','objects'),
    (54,'물고기','character'),
    (55,'진주','objects'),
    (56,'고요함','mood'),
    (57,'자연의 힘','objects'),
    (58,'마법','objects'),
    (59,'오두막','location'),
    (60,'마법사','character'),
    (61,'기대','mood'),
    (62,'계단','location'),
    (63,'마법의 숲','location'),
    (64,'바다 속 왕국','location');

-- dream 테이블에 데이터 삽입
INSERT INTO dream (`dream_id`, `is_shared`, `user_id`, `createdDate`, `lastModifiedDate`, `image`, `summary`, `write_time`, `content`, `interpretation`)
VALUES
    (1,'1',1,'2024-08-13 13:53:14.376138','2024-08-13 13:53:14.376138','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723524780161.png','자유와 자기 발견을 상징하는 꿈.','20240813','어느 날 아침, 잠에서 깨어났는데 등에 무언가 묵직한 감각이 느껴졌어. 거울을 보니 내 등에 거대한 날개가 달려 있는 거야. 처음엔 너무 놀라서 어떻게 해야 할지 몰랐는데, 이내 호기심이 생겨 날개를 펼쳐 보았어. 날개를 한 번 펄럭이자마자 나는 하늘로 날아오르기 시작했어. 구름 사이를 자유롭게 날아다니며, 아래를 내려다보니 도시와 산, 바다가 끝없이 펼쳐져 있었어. 날아다니는 동안 하늘에서 만난 다른 날개 달린 존재들과 이야기를 나누며, 새로운 세계를 경험하게 되었어. 그때 느꼈던 자유로움과 평화로움은 정말 말로 표현할 수 없을 정도였어.','이 꿈은 자유와 자기 발견을 상징하는 의미로 해석될 수 있습니다. 꿈속에서 거대한 날개를 얻고 하늘을 나는 경험은 현재의 생활에서 느끼는 제약이나 스트레스를 극복하고자 하는 내면의 갈망을 나타냅니다. 또한, 다른 날개 달린 존재들과의 소통은 새로운 인연이나 경험을 통해 성장하고 싶다는 욕망을 의미합니다. 전반적으로 이 꿈은 자신을 표현하고 새로운 가능성을 탐색하는 긍정적인 메시지를 담고 있으며, 내면의 자유와 평화를 찾고자 하는 당신의 의지를 반영하고 있습니다.'),
    (2,'1',1,'2024-08-13 13:56:18.727668','2024-08-13 13:56:18.727668','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723524949924.png','미래에 대한 호기심과 가능성을 탐험하는 꿈.','20240813','꿈속에서 나는 이상한 기계를 발견했는데, 호기심에 만져보니 어느새 미래로 시간 여행을 떠난 거야. 도착한 곳은 정말 놀라웠어. 초고층 빌딩들이 하늘을 찌를 듯 솟아있고, 자동차 대신 공중을 나는 탈것들이 바쁘게 움직이고 있었어. 인공지능 로봇들이 사람들 옆에서 일상생활을 돕고 있는 모습도 보였지. 이 도시에서 나는 미래의 나와 만나기도 했어. 내가 상상조차 하지 못했던 기술과 생활 방식들이 나를 매료시켰고, 그곳에서 벌어지는 다양한 사건에 휘말리며 모험을 이어나갔어. 미래가 이렇게 될 수도 있다는 생각에 가슴이 설렜어.','이 꿈은 당신의 호기심과 탐험 욕구를 반영하며, 미래에 대한 긍정적인 기대감을 나타냅니다. 이상한 기계를 통해 시간 여행을 떠난 것은 새로운 기회와 가능성을 추구하는 당신의 마음을 상징합니다. 초고층 빌딩과 공중으로 나는 탈것들은 당신이 꿈꾸는 이상적인 삶과 발전된 기술을 나타내며, 인공지능 로봇들은 당신의 삶에 도움을 줄 수 있는 새로운 요소들을 상징합니다. 미래의 나와 만나는 경험은 자기 발전과 성취에 대한 열망을 의미하며, 다양한 사건에 휘말리는 모험은 변화와 도전에 대한 긍정적인 태도를 보여줍니다. 전반적으로 이 꿈은 당신이 앞으로 나아가고자 하는 열망과 미래에 대한 희망적인 시각을 담고 있습니다.'),
    (3,'0',1,'2024-08-13 13:56:55.976005','2024-08-13 13:56:55.976005','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525001681.png','자아 탐색과 내면의 지혜를 발견하는 꿈.','20240813','한 번은 깊고 울창한 숲 속에 있는 나 자신을 발견했어. 처음엔 길을 잃은 것 같아 두려웠지만, 곧 숲의 아름다움에 빠져들었어. 숲은 정말 끝이 없는 것처럼 보였는데, 길을 잃었다는 생각이 들 즈음 신비로운 생명체들이 나타나 나를 안내해줬어. 그들과 함께 숨겨진 폭포를 발견하고, 오래된 고대 사원도 탐험했지. 그 사원은 정말 신비로웠어. 또, 숲 속 깊숙이 비밀의 정원도 있었는데, 그곳에서 마법 같은 꽃들이 피어 있었어. 꿈속에서 만난 이 생명체들과의 교류는 정말 특별했어. 그들이 전해주는 메시지를 통해 내 마음 속 깊은 곳을 들여다보는 것 같은 기분이 들었어.','이 꿈은 내면의 탐색과 자기 발견을 상징합니다. 깊고 울창한 숲은 당신의 무의식이나 감정의 깊이를 나타내며, 처음에는 두려움과 혼란을 느꼈지만, 숲의 아름다움에 매료된 것은 자아를 탐구하는 과정에서 긍정적인 변화를 경험하고 있음을 의미합니다. 신비로운 생명체들은 당신의 내면의 지혜나 직관을 상징하며, 그들과의 교류는 자신을 이해하고 성장하는 데 필요한 통찰을 제공받고 있다는 것을 나타냅니다. 숨겨진 폭포와 고대 사원, 비밀의 정원은 당신의 잠재력과 꿈, 희망을 상징하며, 마법 같은 꽃들은 새로운 가능성과 창의성을 의미합니다. 전반적으로 이 꿈은 당신이 내면의 여행을 통해 자신을 발견하고, 더 깊은 이해와 연결을 찾아가고 있음을 암시합니다.'),
    (4,'0',1,'2024-08-13 13:57:52.231238','2024-08-13 13:57:52.231238','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525043420.png','다양한 세계를 탐험하며 새로운 경험과 모험을 추구하는 꿈.','20240813','어느 날, 집에서 낡은 책을 하나 발견했는데, 그 책을 펼치자마자 나는 거대한 도서관으로 빨려 들어갔어. 그 도서관은 끝이 없을 정도로 넓었고, 각 책에는 그 책 속 세계로 들어갈 수 있는 마법이 걸려 있었어. 나는 한 권의 책을 집어 들고 펼쳤더니 중세 판타지 세계로 빨려 들어갔어. 그곳에서 용과 기사들이 싸우는 모습을 직접 볼 수 있었지. 또 다른 책을 열었더니 이번에는 우주 전쟁터로 가게 되었어. 각각의 세계가 너무나 생생하게 느껴졌고, 그곳에서 모험을 하는 동안 마치 내가 그 이야기 속 주인공이 된 것 같았어. 모든 이야기를 직접 경험할 수 있다는 게 정말 흥미로웠어.','이 꿈은 당신의 호기심과 상상력이 풍부하다는 것을 나타냅니다. 낡은 책에서 시작된 도서관의 모험은 새로운 지식과 경험에 대한 갈망을 상징하며, 다양한 세계로의 여행은 당신이 현실에서 느끼는 제한을 넘어서는 욕망을 표현합니다. 중세 판타지와 우주 전쟁터와 같은 상징적인 세계들은 당신이 꿈꾸는 이상적인 상황이나 해결하고 싶은 도전 과제를 나타낼 수 있습니다. 이 꿈은 또한 당신이 자신의 내면의 이야기를 탐구하고, 다양한 가능성을 받아들이려는 마음가짐을 가지고 있음을 시사합니다. 결국, 꿈은 창의적인 잠재력과 무한한 가능성을 탐색하는 기회를 제공하고 있습니다.'),
    (5,'0',1,'2024-08-13 13:59:09.617671','2024-08-13 13:59:09.617671','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525118209.png','자아의 반영과 내면의 탐구를 통해 자기 이해를 깊게 하는 꿈.','20240813','평범한 하루였는데, 집안에 있던 오래된 거울을 닦다가 이상한 빛을 발견했어. 거울에 손을 대는 순간 나는 거울 속으로 빨려 들어가고 말았지. 그곳에서 만난 건 나와 똑같이 생긴 또 다른 나였어. 하지만 성격이 완전히 달랐어. 내가 평소에 하지 못했던 일들을 거리낌 없이 해내고 있었지. 그 세계에서 나는 그와 함께 모험을 하며, 내 내면 깊숙이 잠재된 감정들과 마주하게 되었어. 그동안 내가 억누르고 있었던 것들, 그리고 내가 놓쳤던 기회들을 되돌아보는 시간이었어. 그와의 대화를 통해 스스로를 더 잘 이해할 수 있게 되었어.','이 꿈은 자기 발견과 내면의 갈등을 상징적으로 나타내고 있습니다. 오래된 거울은 자신을 되돌아보는 매개체로 작용하며, 거울 속의 또 다른 나와의 만남은 억압된 감정이나 미처 실현하지 못했던 욕망을 마주하는 과정을 의미합니다. 이 꿈을 통해 당신은 자신의 잠재력과 미처 알지 못했던 면모를 탐구하고 있으며, 이는 자아 성장과 자기 수용의 중요한 단계를 나타냅니다. 모험을 통해 스스로를 이해하고, 내면의 목소리에 귀 기울이는 것이 필요하다는 메시지를 담고 있는 꿈입니다.'),
    (6,'1',1,'2024-08-13 14:00:13.183071','2024-08-13 14:00:13.183071','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525179695.png','구름 위의 성을 탐험하며 다양한 세계와 신비한 존재들을 만나는 꿈.','20240713','꿈속에서 나는 구름 위에 떠 있는 거대한 성을 발견했어. 그 성은 마치 동화 속에 나올 법한 아름다움을 자랑했어. 성 안으로 들어가니 각 방마다 전혀 다른 세계가 펼쳐져 있었지. 어떤 방은 끝없이 이어지는 도서관이었고, 또 다른 방은 환상적인 정원으로 가득 차 있었어. 성 안에서 만난 신비한 생명체들은 나를 돕기도 했고, 때로는 수수께끼를 풀어야만 했어. 성 자체가 살아있는 것처럼 끊임없이 변화하면서 새로운 모험을 선사했지. 성을 탐험하는 동안, 나는 이곳에서만 느낄 수 있는 특별한 경험을 할 수 있었어.','이 꿈은 당신의 내면 깊숙한 곳에 있는 창의성과 탐험 욕구를 나타냅니다. 구름 위의 거대한 성은 당신의 상상력이 풍부하고, 새로운 가능성에 대한 긍정적인 태도를 상징합니다. 각 방마다 다른 세계가 펼쳐지는 것은 당신의 삶에서 다양한 경험과 기회를 추구하고 있다는 것을 의미하며, 도서관과 정원은 지식과 성장, 그리고 아름다움에 대한 갈망을 나타냅니다. 신비한 생명체들과의 만남은 당신이 새로운 지혜를 얻고, 문제 해결 능력을 키워가고 있다는 것을 보여줍니다. 전반적으로 이 꿈은 당신이 스스로를 발견하고, 지속적으로 변화하는 삶의 여정을 즐기고 있다는 긍정적인 메시지를 담고 있습니다.'),
    (7,'1',1,'2024-08-13 14:00:53.528475','2024-08-13 14:00:53.528475','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525234378.png','시간이 멈춘 도시를 탐험하는 꿈','20240713','한 번은 도시에 있는 모든 것이 멈추는 꿈을 꿨어. 사람들도, 자동차들도, 모든 것이 멈춰 있었지. 나만이 이 멈춘 시간 속에서 자유롭게 움직일 수 있었어. 처음에는 이상하고 무서웠지만, 이내 호기심이 생겨 멈춘 도시를 탐험하기 시작했어. 평소에는 들어갈 수 없던 장소를 들어가고, 멈춘 사람들의 표정과 속마음을 읽을 수 있었어. 도시 곳곳을 탐험하면서 시간이 멈추지 않았다면 놓쳤을 것들을 발견했지. 이 시간 멈춤 속에서 나는 소중한 기회를 다시 한번 생각해 볼 수 있었어.','이 꿈은 현재의 삶에서 느끼는 압박감이나 스트레스를 반영할 수 있습니다. 도시가 멈춘 상황은 일상에서 벗어나고 싶은 욕구를 상징하며, 혼자서만 경험하는 탐험은 자기 발견과 내면의 성찰을 나타냅니다. 멈춘 사람들의 표정과 속마음을 읽는 것은 타인과의 관계에서 진정한 감정을 이해하고 싶다는 바람을 의미할 수 있습니다. 이 꿈을 통해 소중한 기회를 다시 생각해보라는 메시지를 받았으니, 일상 속에서 놓치고 있는 것들에 대해 다시 한번 돌아보는 기회를 가져보는 것이 좋겠습니다.'),
    (8,'1',1,'2024-08-13 14:01:33.395597','2024-08-13 14:01:33.395597','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525278074.png','바다 속 왕국에서의 탐험과 특별한 능력 부여를 통해 자신의 잠재력과 내면의 평화, 그리고 다른 생명체에 대한 책임을 깨닫는 꿈.','20240713',' 꿈속에서 나는 깊은 바다 속에 있는 아름다운 왕국으로 들어갔어. 바닷속 깊은 곳에 자리잡은 그 왕국은 산호와 희귀한 바다 생물들로 가득 차 있었어. 놀랍게도 나는 물고기들과 대화할 수 있었고, 그들과 함께 왕국을 탐험하게 되었어. 왕국의 궁전은 진주와 산호로 장식되어 있었고, 그곳에는 바다의 신비를 지키는 지혜로운 왕이 있었어. 왕은 나에게 특별한 능력을 전수해 주었고, 나는 그 능력으로 바다 생물들을 도와주고 왕국을 위협하는 위험으로부터 보호하는 임무를 맡게 되었어. 바다 속에서의 삶은 평화로웠고, 그곳에서 느낀 고요함과 아름다움은 현실에서는 느낄 수 없는 것이었어.','이 꿈은 깊은 바다 속 아름다운 왕국을 탐험하는 경험을 통해 내면의 평화와 조화로운 삶을 갈망하고 있음을 나타냅니다. 물고기들과 대화하고 왕국의 지혜로운 왕으로부터 특별한 능력을 전수받는 것은 자신의 잠재력과 창의력을 발견하고, 주변 세계와의 연결을 느끼고자 하는 욕구를 상징합니다. 또한, 바다 생물들을 돕고 왕국을 보호하는 임무는 책임감과 보호의 욕구를 나타내며, 다른 이들에게 긍정적인 영향을 미치고 싶은 마음을 반영합니다. 이 꿈은 현실에서의 스트레스와 혼란을 잊고, 보다 깊은 내면의 평화와 조화를 추구하려는 마음의 소리를 전달하고 있습니다.'),
    (9,'0',1,'2024-08-13 14:03:03.468410','2024-08-13 14:03:03.468410','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525372075.png','자아의 성장과 자연과의 조화를 이루는 꿈.','20240724','깊은 숲 속을 걷다가, 우연히 작은 오두막을 발견했어. 그 오두막 안에는 세상을 변화시키는 힘을 가진 마법사가 살고 있었지. 마법사는 나를 환영하며, 나에게 마법을 가르쳐주겠다고 했어. 나는 그의 제자가 되어 자연의 힘을 이용해 마법을 부리는 방법을 배우게 되었어. 시간이 지나면서 나는 마법사의 신뢰를 얻게 되었고, 숲 속에서 발생하는 여러 가지 사건들을 해결하는 임무를 맡게 되었어. 마법사의 지도를 받으며, 숲 속의 생명체들과 교류하고 자연과 조화를 이루는 법을 배웠지. 그 과정에서 나는 내 내면 깊숙이 잠재된 힘을 발견하게 되었고, 이 숲을 지키는 수호자가 되었어.','이 꿈은 당신의 내면의 힘과 잠재력을 발견하고, 자연과의 조화로운 관계를 형성하고자 하는 욕망을 상징합니다. 깊은 숲은 당신의 무의식과 깊은 감정의 세계를 나타내며, 작은 오두막과 마법사는 안전한 공간과 당신의 성장 가능성을 의미합니다. 마법을 배우고 마법사의 신뢰를 얻는 과정은 자신을 발전시키고, 주변과의 조화로운 관계를 통해 문제를 해결하는 능력을 키워가는 과정을 반영합니다. 이 꿈은 당신이 자신의 능력을 인식하고, 세상에 긍정적인 영향을 미치고자 하는 열망을 나타내며, 삶의 어려움을 극복하고 더 큰 목적을 추구하는 여정을 의미합니다.'),
    (10,'1',1,'2024-08-13 14:03:41.057587','2024-08-13 14:03:41.057587','https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/image_1723525403493.png','끝없는 계단을 오르며 새로운 세계를 탐험하는 꿈.','20240715','어느 날 꿈속에서 나는 끝이 보이지 않는 계단을 발견했어. 이 계단은 정말 끝없이 이어졌고, 나는 그 끝이 무엇일지 궁금해져 계단을 오르기 시작했지. 계단을 오를 때마다 전혀 다른 세계로 연결되었어. 각 세계마다 독특한 도전과 보상이 기다리고 있었지. 어떤 세계에서는 마법의 숲을 탐험하고, 또 다른 세계에서는 바다 속 왕국을 발견하기도 했어. 계단을 오르면서 나는 점점 더 깊이 빠져들었고, 그 끝에 무엇이 기다리고 있을지 기대하며 계속 나아갔어. 하지만 계단의 끝은 쉽게 보이지 않았고, 계속해서 새로운 세계로의 모험이 이어졌어.','이 꿈은 당신의 삶에서 새로운 가능성과 탐험에 대한 갈망을 상징합니다. 끝이 보이지 않는 계단은 무한한 성장과 발전의 기회를 나타내며, 각 세계는 당신이 마주하는 다양한 도전과 경험을 의미합니다. 마법의 숲이나 바다 속 왕국과 같은 독특한 장소들은 당신의 창의력과 호기심이 풍부하다는 것을 보여줍니다. 이러한 꿈은 당신이 현재의 상황에서 벗어나고 새로운 목표를 향해 나아가고자 하는 욕구를 반영하며, 앞으로의 여정에서 기대와 희망을 가지고 계속 도전하라는 메시지를 담고 있습니다.');

-- comment 테이블에 데이터 삽입
INSERT INTO comment (`comment_id`, `dream_id`, `likes_count`, `user_id`, `content`)
VALUES
    (1,10,5,1,'이 꿈들은 정말 상상력이 풍부하고 신비로워요!'),
    (2,8,6,1,'마치 한 편의 영화처럼 생생하게 느껴지네요.'),
    (3,7,7,1,'이런 꿈들을 꾸다니 정말 부럽습니다.'),
    (4,6,8,1,'현실에서는 절대 경험할 수 없는 특별한 모험들이 가득한 것 같아요.'),
    (5,1,20,1,'날개를 달고 하늘을 날아다니거나 현실에서는 절대 경험할 수 없는 특별한 모험들이 가득한 것 같아요.'),
    (6,2,300,1,'미래의 도시를 탐험하고 절대 경험할 수 없는 특별한 모험들이 가득한 것 같아요.'),
    (7,10,2,2,'정말 인상적인 꿈이네요! 나도 이런 꿈을 꾸고 싶어요.'),
    (8,8,3,2,'미래의 도시에서의 모험이라니 상상만으로도 멋지네요.'),
    (9,7,4,2,'꿈속에서 나와 만나게 되는 상황이 정말 흥미로워요.'),
    (10,6,10,2,'이런 모험을 현실에서도 경험할 수 있다면 얼마나 좋을까요.'),
    (11,1,15,2,'날개를 달고 하늘을 나는 느낌은 자유롭고 행복할 것 같아요.'),
    (12,2,25,2,'미래의 도시에서의 경험은 정말 잊지 못할 것 같아요.');

-- comment_like 테이블에 데이터 삽입
INSERT INTO comment_like (`comment_id`, `comment_like_id`, `user_id`)
VALUES
    (1,1,1),
    (2,2,1),
    (3,3,1),
    (4,4,1),
    (5,5,1),
    (6,6,1),
    (7,7,2),
    (8,8,2),
    (9,9,2),
    (10,10,2),
    (11,11,2),
    (12,12,2),
    (1,13,1),
    (2,14,1),
    (3,15,1),
    (4,16,1),
    (5,17,1),
    (6,18,1),
    (7,19,2),
    (8,20,2),
    (9,21,2),
    (10,22,2),
    (11,23,2),
    (12,24,2);

-- dream_category 테이블에 데이터 삽입
INSERT INTO dream_category (`category_id`, `dream_category_id`, `dream_id`)
VALUES
    (4,1,1),
    (5,2,1),
    (8,3,1),
    (9,4,1),
    (2,5,1),
    (6,6,1),
    (1,7,1),
    (7,8,1),
    (3,9,1),
    (11,10,1),
    (12,11,1),
    (10,12,1),
    (13,13,2),
    (17,14,2),
    (15,15,2),
    (12,16,2),
    (18,17,2),
    (1,18,2),
    (14,19,2),
    (16,20,2),
    (19,21,2),
    (22,22,3),
    (24,23,3),
    (21,24,3),
    (26,25,3),
    (23,26,3),
    (27,27,3),
    (25,28,3),
    (20,29,3),
    (1,30,3),
    (29,31,4),
    (1,32,4),
    (34,33,4),
    (28,34,4),
    (32,35,4),
    (33,36,4),
    (30,37,4),
    (31,38,4),
    (6,39,5),
    (1,40,5),
    (35,41,5),
    (36,42,5),
    (37,43,5),
    (39,44,5),
    (38,45,5),
    (40,46,6),
    (28,47,6),
    (44,48,6),
    (22,49,6),
    (43,50,6),
    (46,51,6),
    (1,52,6),
    (41,53,6),
    (42,54,6),
    (45,55,6),
    (1,56,7),
    (47,57,7),
    (25,58,7),
    (48,59,7),
    (12,60,7),
    (54,61,8),
    (52,62,8),
    (56,63,8),
    (1,64,8),
    (50,65,8),
    (51,66,8),
    (55,67,8),
    (49,68,8),
    (53,69,8),
    (57,70,9),
    (60,71,9),
    (20,72,9),
    (59,73,9),
    (58,74,9),
    (1,75,9),
    (22,76,9),
    (62,77,10),
    (1,78,10),
    (61,79,10),
    (64,80,10),
    (63,81,10),
    (12,82,10);


INSERT INTO room (`room_id`,`user_id`,`createdDate`,`lastModifiedDate`,`youtube_link`,`thumbnail`,`title`) VALUES (1,1,'2024-08-13 16:00:12.523539','2024-08-13 16:00:12.523539','https://www.youtube.com/watch?v=U34kLXjdw90','https://img.youtube.com/vi/U34kLXjdw90/0.jpg','【Playlist】지브리의 피아노');
INSERT INTO room (`room_id`,`user_id`,`createdDate`,`lastModifiedDate`,`youtube_link`,`thumbnail`,`title`) VALUES (2,1,'2024-08-13 16:03:05.514915','2024-08-13 16:03:05.514915','https://www.youtube.com/watch?v=I3CW_pVZiQA','https://img.youtube.com/vi/I3CW_pVZiQA/0.jpg','모든 소원이 이루어지는 주파수');
INSERT INTO room (`room_id`,`user_id`,`createdDate`,`lastModifiedDate`,`youtube_link`,`thumbnail`,`title`) VALUES (3,1,'2024-08-13 16:06:39.806480','2024-08-13 16:06:39.806480','https://www.youtube.com/watch?v=PLg0kqP-whA','https://img.youtube.com/vi/PLg0kqP-whA/0.jpg','루시드드림 유도음악');


-- INSERT INTO Room (user_id, createdDate, lastModifiedDate, youtube_link, thumbnail, title)
-- VALUES
--     (1, '2024-08-13 10:00:00.000000', '2024-08-13 11:00:00.000000', 'https://www.youtube.com/watch?v=sample1', 'https://example.com/thumbnail1.jpg', 'Sample Room 1'),
--     (2, '2024-08-12 09:30:00.000000', '2024-08-12 10:30:00.000000', 'https://www.youtube.com/watch?v=sample2', 'https://example.com/thumbnail2.jpg', 'Sample Room 2'),
--     (3, '2024-08-11 08:00:00.000000', '2024-08-11 09:00:00.000000', 'https://www.youtube.com/watch?v=sample3', 'https://example.com/thumbnail3.jpg', 'Sample Room 3');

-- INSERT INTO Notification (sent, user_id, createdDate, lastModifiedDate, scheduleTime, notificationType) VALUES
-- (1, 1, '2024-08-01 10:00:00', '2024-08-01 10:00:00', '2024-08-01 07:00:00', 'MORNING_WAKEUP_REMINDER'),
-- (1, 2, '2024-08-01 10:05:00', '2024-08-01 10:05:00', '2024-08-01 07:05:00', 'MORNING_WAKEUP_REMINDER'),
-- (0, 3, '2024-08-01 10:10:00', '2024-08-01 10:10:00', '2024-08-01 07:10:00', 'SLEEP_REMINDER'),
-- (1, 4, '2024-08-01 10:15:00', '2024-08-01 10:15:00', '2024-08-01 07:15:00', 'SLEEP_REMINDER'),
-- (0, 5, '2024-08-01 10:20:00', '2024-08-01 10:20:00', '2024-08-01 07:20:00', 'MORNING_WAKEUP_REMINDER');

-- INSERT INTO Room (user_id, createdDate, lastModifiedDate, youtube_link, thumbnail, title) VALUES
-- (1, '2024-08-01 11:00:00', '2024-08-01 11:00:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg', 'Dream Analysis: Flying'),
-- (2, '2024-08-01 11:05:00', '2024-08-01 11:05:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg', 'Exploring Dreams in the Forest'),
-- (3, '2024-08-01 11:10:00', '2024-08-01 11:10:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg', 'The Psychology of Meeting Old Friends'),
-- (4, '2024-08-01 11:15:00', '2024-08-01 11:15:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg', 'Facing Your Fears: Animal Dreams'),
-- (5, '2024-08-01 11:20:00', '2024-08-01 11:20:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://dreamongbucket.s3.ap-northeast-2.amazonaws.com/dreamongLogo.jpg', 'Interpreting Dreams about Water');
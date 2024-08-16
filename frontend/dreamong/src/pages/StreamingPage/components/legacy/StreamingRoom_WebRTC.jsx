import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { OpenVidu } from 'openvidu-browser';
import YouTube from 'react-youtube';
import axios from 'axios';

import { useRecoilValue } from 'recoil';
import { getStreamingRoomById } from '../../../../recoil/selectors';

const StreamingRoom = () => {
  const { roomId } = useParams();
  const getRoomById = useRecoilValue(getStreamingRoomById);
  const room = getRoomById(roomId);

  const [session, setSession] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [roomInfo, setRoomInfo] = useState({ title: '', participantCount: 0 });
  const [inputMessage, setInputMessage] = useState('');
  const playerRef = useRef(null);

  useEffect(() => {
    // OpenVidu 세션 초기화 및 설정
    const OV = new OpenVidu();
    const session = OV.initSession();

    // 새 스트림이 생성될 때 구독
    session.on('streamCreated', (event) => {
      session.subscribe(event.stream, undefined);
    });

    // 채팅 메시지 수신 시 처리
    session.on('signal:chat', (event) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: event.data, fromSelf: event.from.connectionId === session.connection.connectionId },
      ]);
    });

    // 백엔드에서 토큰 생성 및 방 정보 가져오기
    // axios
    //   .post(`/api/rooms/${roomId}/join`)
    //   .then((response) => {
    //     const { token, youtubeLink, title, participantCount } = response.data;
    //     setVideoId(extractVideoId(youtubeLink));
    //     setRoomInfo({ title, participantCount });
    //     return session.connect(token);
    //   })
    //   .then(() => {
    //     setSession(session);
    //   })
    //   .catch((error) => {
    //     console.error('세션 연결 오류:', error);
    //   });

    setVideoId(extractVideoId(room.youtubeLink)); // 테스트용 코드

    // 컴포넌트 언마운트 시 세션 연결 해제
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [roomId]);

  // 채팅 메시지 전송 함수
  const sendMessage = () => {
    if (inputMessage && session) {
      session.signal({
        data: inputMessage,
        type: 'chat',
      });
      setInputMessage('');
    }
  };

  // YouTube 링크에서 비디오 ID 추출 함수
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // YouTube 플레이어 준비 완료 시 호출되는 함수
  const onReady = (event) => {
    playerRef.current = event.target;
  };

  return (
    <section className="mx-2">
      <div className="mb-5">
        {/* YouTube 플레이어를 위한 반응형 컨테이너 */}
        <div className="my-5 w-full overflow-hidden rounded-md bg-slate-600 text-white">
          {/* 16:9 비율을 위한 패딩 설정 */}
          <div className="relative pt-[56.25%]">
            <YouTube
              videoId={videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 0,
                  loop: 1,
                  rel: 0, //관련 동영상 표시하지 않음
                  modestbranding: 1, // 컨트롤 바에 youtube 로고를 표시하지 않음
                },
              }}
              onReady={onReady}
              className="absolute left-0 top-0 h-full w-full"
            />
          </div>
        </div>
        <div className="flex w-full justify-between text-white">
          <p>{room.title}</p>
          <p>{room.participantCount}명 시청중</p>
        </div>
      </div>
      {/* 채팅 영역 */}
      <div className="h-[57dvh] rounded-t-lg bg-slate-700 px-3">
        <div className="mb-4 h-4/5 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.fromSelf ? 'text-blue-400' : 'text-white'}`}>
              {message.fromSelf ? '나: ' : '상대방: '}
              {message.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow rounded-l-md p-2 text-black"
            placeholder="메시지를 입력하세요..."
          />
          <button onClick={sendMessage} className="rounded-r-md bg-blue-500 p-2 text-white">
            전송
          </button>
        </div>
      </div>
    </section>
  );
};

export default StreamingRoom;

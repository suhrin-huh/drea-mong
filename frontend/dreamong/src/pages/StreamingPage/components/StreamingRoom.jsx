import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import axios from 'axios';
import io from 'socket.io-client';

import { useRecoilValue } from 'recoil';
import { getStreamingRoomById } from '../../../recoil/selectors';

const StreamingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const getRoomById = useRecoilValue(getStreamingRoomById);
  const room = getRoomById(roomId);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [roomInfo, setRoomInfo] = useState({ title: '', participantCount: 0 });
  const [inputMessage, setInputMessage] = useState('');
  const playerRef = useRef(null);

  // 소켓 관리 관련 useEffect
  useEffect(() => {
    // Socket.io 연결 설정
    const newSocket = io('');
    setSocket(newSocket);

    setVideoId(extractVideoId(room.youtubeLink)); // 임시 코드(추후 삭제)

    // 소켓 이벤트 리스너 설정
    // 방 입장
    newSocket.emit('join-room', roomId);

    // 채팅 관련 로직
    newSocket.on('chat-message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // 비디오 시간 동기화 로직
    newSocket.on('video-time-update', (time) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time);
      }
    });

    newSocket.on('participant-count-update', (count) => {
      // 참가자 수 업데이트 로직
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      newSocket.close();
    };
  }, [roomId]);

  // 채팅 메시지 전송 함수
  const sendMessage = () => {
    if (inputMessage && socket) {
      socket.emit('chat-message', { roomId, message: inputMessage });
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
    // 주기적으로 현재 재생 시간을 서버에 전송
    setInterval(() => {
      socket.emit('video-time-update', { roomId, time: event.target.getCurrentTime() });
    }, 5000);
  };

  return (
    <section className="mx-2">
      <div className="mb-5">
        {/* YouTube 플레이어 */}
        <div className="my-5 w-full overflow-hidden rounded-md bg-slate-600 text-white">
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
                  rel: 0,
                  modestbranding: 1,
                },
              }}
              onReady={onReady}
              className="absolute left-0 top-0 h-full w-full"
            />
          </div>
        </div>
        <div className="flex w-full justify-between text-white">
          <p>{roomInfo.title}</p>
          <p>{roomInfo.participantCount}명 시청중</p>
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

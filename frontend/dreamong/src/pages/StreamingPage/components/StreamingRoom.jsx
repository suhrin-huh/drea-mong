import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import axios from 'axios';
import io from 'socket.io-client';

import { useRecoilValue } from 'recoil';
import { userState, baseURLState, socketURLState } from '../../../recoil/atoms';

const StreamingRoom = () => {
  const navigate = useNavigate();

  const { roomId } = useParams(); // URL 파라미터에서 방 ID 추출
  const [socket, setSocket] = useState(null); // 소켓 연결 상태 관리
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록 상태 관리
  const [videoId, setVideoId] = useState(''); // YouTube 비디오 ID 상태 관리
  const [roomInfo, setRoomInfo] = useState({}); // 방 정보 상태 관리 (제목, YouTube 링크, 참가자 수)
  const [inputMessage, setInputMessage] = useState(''); // 채팅 입력 메시지 상태 관리
  const playerRef = useRef(null); // YouTube 플레이어 참조 관리

  const userNickname = useRecoilValue(userState).nickname;
  const baseURL = useRecoilValue(baseURLState);
  const socketURL = useRecoilValue(socketURLState);

  const messageEndRef = useRef(null); // 메시지 목록의 끝 참조하기 위한 ref
  const messageContainerRef = useRef(null); // 메시지 컨테이너 전체를 참조하기 위한 ref
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // 컴포넌트 마운트 시 방 정보를 가져오는 함수
  const fetchRoomInfo = useCallback(() => {
    axios({
      method: 'get',
      url: `${baseURL}/rooms/${roomId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        withCredentials: true,
      },
    })
      .then((response) => {
        setRoomInfo(response.data.data);
        setVideoId(extractVideoId(response.data.data.youtubeLink));
      })
      .catch((err) => {
        console.error('방 정보를 가져오는데 실패했습니다:', err);
      });
  }, [roomId]);

  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    fetchRoomInfo();

    const newSocket = io(socketURL, {
      // transports: ['websocket'],
      // upgrade: false,
      // reconnection: true,
      // reconnectionAttempts: 5,
      // timeout: 1000,
      secure: true,
    });
    setSocket(newSocket);

    // 방 입장 이벤트 발생
    newSocket.emit('join-room', roomId);

    // 채팅 메시지 수신 이벤트 리스너
    newSocket.on('chat-message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      // 새 메시지가 도착하면 자동 스크롤 활성화
      setShouldAutoScroll(true);
    });

    // 비디오 시간 동기화 이벤트 리스너
    newSocket.on('video-time-update', (time) => {
      if (playerRef.current && Math.abs(playerRef.current.getCurrentTime() - time) > 3) {
        playerRef.current.seekTo(time);
      }
    });

    // 참가자 수 업데이트 이벤트 리스너
    newSocket.on('participant-count-update', (count) => {
      setRoomInfo((prev) => ({ ...prev, participantCount: count }));
    });

    newSocket.on('force-leave', (roomId) => {
      navigate('/streaming');
      alert('관리자에 의해 현재 접속 중인 방이 삭제되었습니다!');
    });

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      newSocket.emit('leave-room', roomId);
      newSocket.close();
    };
  }, [roomId, fetchRoomInfo]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지가 추가되거나 shouldAutoScroll 상태가 변경될 때마다 실행
  useEffect(() => {
    // 자동 스크롤이 활성화된 경우에만 스크롤을 아래로 이동
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // 사용자의 스크롤 동작을 감지하는 함수
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      // 스크롤이 맨 아래에 있는지 확인
      const isScrollecToBottom = scrollHeight - scrollTop - clientHeight < 1;
      // 스크롤 위치에 따라 자동 스크롤 상태 업데이트
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  // 채팅 메시지 전송 함수
  const sendMessage = useCallback(() => {
    if (inputMessage && socket) {
      socket.emit('chat-message', { roomId, nickname: userNickname, message: inputMessage });
      setInputMessage('');
    }
  }, [inputMessage, socket, roomId]);

  // YouTube 링크에서 비디오 ID 추출 함수
  const extractVideoId = useCallback((url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, []);

  // YouTube 플레이어 준비 완료 시 호출되는 함수
  const onReady = useCallback(
    (event) => {
      playerRef.current = event.target;

      // 주기적으로 현재 재생 시간을 서버에 전송
      const intervalId = setInterval(() => {
        if (socket) {
          socket.emit('video-time-update', { roomId, time: event.target.getCurrentTime() });
        }
        // 영상 재생 상태가 멈춤 상태일 때(0) 재생 시작
        if (!event.target.getPlayerState()) {
          event.target.playVideo();
        }
      }, 5000);

      // 컴포넌트 언마운트 또는 의존성 변경 시 인터벌 정리
      return () => clearInterval(intervalId);
    },
    [socket, roomId],
  );

  return (
    <section className="mx-2 flex h-[calc(100dvh-130px)] flex-col">
      <div className="mb-5">
        {/* YouTube 플레이어 */}
        <div className="my-3 w-full overflow-hidden rounded-md bg-slate-600 text-white">
          <div className="relative pt-[56.25%]">
            <YouTube
              videoId={videoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  loop: 1,
                  rel: 0,
                  modestbranding: 1,
                },
              }}
              onReady={onReady}
              className="absolute left-0 top-0 h-full w-full touch-none select-none"
            />
          </div>
        </div>
        {/* 방 정보 표시 */}
        <div className="flex w-full justify-between text-white">
          <p>{roomInfo.title}</p>
          <p>{roomInfo.participantCount}명 시청중</p>
        </div>
      </div>
      {/* 채팅 메시지 표시 영역 */}
      <div
        className="flex flex-grow flex-col overflow-hidden rounded-t-lg border-b-2 border-gray-500 bg-black bg-opacity-50 backdrop-blur-sm backdrop-filter"
        ref={messageContainerRef}
        onScroll={handleScroll}
      >
        <div className="mx-4 mt-auto overflow-y-auto">
          <div className="mb-2 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 ${message.nickname === userNickname ? 'text-end' : null}`}>
                <p className="text-sm text-gray-300">{message.nickname}</p>
                <p className={`text-white ${message.nickname === userNickname ? 'mr-2' : 'ml-2'}`}>{message.message}</p>
              </div>
            ))}
            <div ref={messageEndRef} /> {/* 메시지 목록의 끝을 표시하는 요소 */}
          </div>
        </div>
      </div>
      {/* 채팅 입력 영역 */}
      <div className="flex rounded-b-lg bg-gray-700">
        <input
          type="text"
          value={inputMessage}
          onChange={(event) => setInputMessage(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
          className="flex-grow appearance-none bg-transparent p-2 text-white"
          placeholder="메시지를 입력하세요..."
          aria-label="채팅 메시지 입력"
        />
        <button onClick={sendMessage} className="rounded-br-md bg-primary-500 p-3 text-white" aria-label="메시지 전송">
          전송
        </button>
      </div>
    </section>
  );
};

export default StreamingRoom;

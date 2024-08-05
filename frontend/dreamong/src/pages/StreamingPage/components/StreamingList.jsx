import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import Button from '../../../components/Button';

Modal.setAppElement('#root');

const StreamingList = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);

  const [rooms, setRooms] = useState([]);
  // isAdmin : 관리자 여부 확인용 => 추후에 default value를 false로 변경 예정!!
  const [isAdmin, setIsAdmin] = useState(true);
  const [newRoom, setNewRoom] = useState({ title: '', youtubeLink: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    // 현재 사용자의 권한 확인(관리자 여부)
    checkAdminStatus();

    // 방 목록 업데이트
    // fetchRooms();

    // 더미 데이터 사용 => 추후에 서버와 정상 연결 되면 setRooms([...]) 이하 부분 코드 제거 예정
    setRooms(
      [
        {
          token: 1,
          title: '지브리 OST 모음짐',
          youtubeLink: 'https://www.youtube.com/watch?v=U34kLXjdw90&ab_channel=SoothingPianoRelaxing',
        },
        { token: 2, title: '자면서 듣는 재즈 음악', youtubeLink: 'test2' },
        {
          token: 3,
          title: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요',
          youtubeLink: 'test3',
        },
        {
          token: 4,
          title: '오늘 하루 고생한 당신을 위한 힐링 음악',
          youtubeLink:
            'https://www.youtube.com/watch?v=p2fxv3PAtLU&ab_channel=%ED%9E%90%EB%A7%81%ED%8A%B8%EB%A6%AC%EB%AE%A4%EC%A7%81HealingTreeMusic%26Sounds',
        },
        {
          token: 5,
          title: '마하반야바라밀다심경 관자재보살...',
          youtubeLink: 'test5',
        },
      ].map((room) => ({
        ...room,
        thumbnailImg: `https://img.youtube.com/vi/${extractVideoId(room.youtubeLink)}/0.jpg`,
      })),
    );
  }, []);

  // 관리자 여부 확인 함수
  const checkAdminStatus = () => {
    const userInfo = localStorage.getItem('role');
    setIsAdmin(userInfo === 'ADMIN' ? true : false);
  };

  // 방 목록 가져오기 함수
  const fetchRooms = () => {
    axios({
      method: 'get',
      url: '/api/rooms', // 백엔드 api 명세 관련 논의 후 수정 예정
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        setRooms(response.data);
        console.log('방 목록 fetch 완료!');
      })
      .catch((error) => {
        console.error('방 목록 조회 중 오류 발생', error);
        setError('방 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
      });
  };

  // 유튜브 링크에서 비디오 ID 추출 함수
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 스트리밍 방 입장 시 리다이렉션 함수
  const handleNavigate = (roomId) => {
    navigate(`${roomId}`);
  };

  // 모달 on/off 함수
  const toggleModalIsOpen = () => {
    if (!modalIsOpen) {
      setModalIsOpen(true);
      setTimeout(() => setModalContentVisible(true), 50);
    } else {
      setModalContentVisible(false);
      setTimeout(() => setModalIsOpen(false), 300);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRoom = (event) => {
    event.preventDefault();

    // 방 생성 API 호출 (주석 처리)
    axios({
      method: 'post',
      url: '/api/create-rooms',
      data: newRoom,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        const createdRoom = response.data;
        createdRoom.thumbnailImg = `https://img.youtube.com/vi/${extractVideoId(createdRoom.youtubeLink)}/0.jpg`;
        setRooms((prev) => [...prev, createdRoom]);
        toggleModalIsOpen();
        console.log('방 생성 성공!');
        setNewRoom({ title: '', youtubeLink: '' });
        console.log('newRoom State 초기화 완료');
      })
      .catch((error) => {
        console.error('방 생성 중 오류 발생', error);
        setError('방 생성에 실패했습니다. 나중에 다시 시도해 주세요.');
      });

    // 더미 데이터로 방 생성
    const createdRoom = {
      token: rooms.length + 1,
      title: newRoom.title,
      youtubeLink: newRoom.youtubeLink,
      thumbnailImg: `https://img.youtube.com/vi/${extractVideoId(newRoom.youtubeLink)}/0.jpg`,
      participantCount: 0,
    };
    setRooms((prev) => [...prev, createdRoom]);
    toggleModalIsOpen();
    setNewRoom({ title: '', youtubeLink: '' });
  };

  if (error) {
    return (
      <div className="text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="mx-2 flex flex-col text-white">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={toggleModalIsOpen}
        className="fixed inset-x-0 left-5 right-5 top-20 z-50 flex items-center justify-center overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out"
        closeTimeoutMS={300}
        style={{
          overlay: {
            backgroundColor: modalIsOpen ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
          },
        }}
      >
        <div
          className={`w-full max-w-md rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ease-in-out ${
            modalContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <h2 className="mb-4 text-center text-2xl font-bold">스트리밍 방 생성</h2>
          <form onSubmit={handleCreateRoom}>
            <div className="mb-4">
              <label htmlFor="title" className="text-md block font-medium text-gray-700">
                방 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newRoom.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-[1px] border-gray-200 p-2 text-base text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="youtubeLink" className="text-md block font-medium text-gray-700">
                YouTube 링크
              </label>
              <input
                type="url"
                id="youtubeLink"
                name="youtubeLink"
                value={newRoom.youtubeLink}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-[1px] border-gray-200 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={toggleModalIsOpen}>
                취소
              </Button>
              <Button variant="primary" type="submit">
                방 만들기
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {rooms.map((room) => (
        <button
          key={room.token}
          onClick={() => handleNavigate(room.token)}
          className="mb-4 flex h-full w-full flex-col rounded-lg bg-black bg-opacity-50 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter"
        >
          <img src={room.thumbnailImg} alt={room.title} className="mb-3 h-48 w-full rounded-md object-cover" />
          <div className="flex w-full justify-between">
            <p className="max-w-[60%] truncate">{room.title}</p>
            <p>{room.participantCount}명 시청중</p>
          </div>
        </button>
      ))}

      {isAdmin && (
        <Button variant="primary" size="lg" fullWidth={true} className="mb-3" onClick={toggleModalIsOpen}>
          방 생성하기
        </Button>
      )}
    </section>
  );
};

export default StreamingList;

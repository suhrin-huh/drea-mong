import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import Button from '../../../../components/Button';

Modal.setAppElement('#root');

const StreamingList = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);

  const [rooms, setRooms] = useState([]);
  // isAdmin : 관리자 여부 확인용 => 추후에 localStorage에서 로그인 사용자 정보 확인하는 코드 작성

  let isAdmin = true;
  const [newRoom, setNewRoom] = useState({ title: '', description: '', youtubeLink: '' });

  useEffect(() => {
    // axios({
    //   method: 'get',
    // })
    //   .then((response) => {
    //     alert('스트리밍방 패치 완료');
    //     setRooms(response.data);
    //   })
    //   .catch((error) => {
    //     console.error('방 목록 조회 중 오류 발생', error);
    //   });

    setRooms([
      {
        token: 1,
        title: '지브리 OST 모음짐',
        youtubeLink: 'https://www.youtube.com/watch?v=U34kLXjdw90&ab_channel=SoothingPianoRelaxing',
        thumbnailImg: '',
        participantCount: 25,
      },
      { token: 2, title: '자면서 듣는 재즈 음악', youtubeLink: 'test2', thumbnailImg: '', participantCount: 43 },
      {
        token: 3,
        title: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요',
        youtubeLink: 'test3',
        thumbnailImg: '',
        participantCount: 132,
      },
      {
        token: 4,
        title: '오늘 하루 고생한 당신을 위한 힐링 음악',
        youtubeLink:
          'https://www.youtube.com/watch?v=p2fxv3PAtLU&ab_channel=%ED%9E%90%EB%A7%81%ED%8A%B8%EB%A6%AC%EB%AE%A4%EC%A7%81HealingTreeMusic%26Sounds',
        thumbnailImg: '',
        participantCount: 24,
      },
      {
        token: 5,
        title: '마하반야바라밀다심경 관자재보살...',
        youtubeLink: 'test5',
        thumbnailImg: '',
        participantCount: 5,
      },
    ]);
  }, []);

  const handleNavigate = (roomId) => {
    navigate(`${roomId}`);
  };

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

    // 여기에 방 생성 API 호출 로직 추가
    console.log('New room:', newRoom);
    // 임시로 새 방을 목록에 추가
    setRooms((prev) => [
      ...prev,
      {
        roomId: rooms.length + 1,
        roomName: newRoom.title,
        description: newRoom.description,
        count: 0,
      },
    ]);

    toggleModalIsOpen();
    setNewRoom({ title: '', youtubeLink: '' });
  };

  return (
    <section className="mx-2 flex flex-col text-white">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={toggleModalIsOpen}
        className="fixed inset-x-0 top-20 z-50 flex items-center justify-center overflow-y-auto"
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
          onClick={() => {
            handleNavigate(room.token);
          }}
          // className="mb-4 flex flex-col rounded-md bg-zinc-900 p-4"
          className="mb-4 flex h-full w-full flex-col rounded-lg bg-black bg-opacity-50 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter"
        >
          <img src="placeholder.jpg" alt={room.title} className="mb-3 h-40 w-full object-cover" />
          <div className="flex w-full justify-between">
            <p>{room.title}</p>
            <p>{room.participantCount}명 시청중</p>
          </div>
        </button>
      ))}

      {isAdmin ? (
        <Button variant="primary" size="lg" fullWidth={true} className="mb-3" onClick={toggleModalIsOpen}>
          방 생성하기
        </Button>
      ) : null}
    </section>
  );
};

export default StreamingList;

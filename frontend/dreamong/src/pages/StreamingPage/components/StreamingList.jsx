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
      { roomId: 1, roomName: '지브리 OST 모음짐', description: 'test1', count: 25 },
      { roomId: 2, roomName: '자면서 듣는 재즈 음악', description: 'test2', count: 43 },
      { roomId: 3, roomName: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요', description: 'test3', count: 132 },
      { roomId: 4, roomName: '오늘 하루 고생한 당신을 위한 힐링 음악', description: 'test4', count: 24 },
      { roomId: 5, roomName: '마하반야바라밀다심경 관자재보살...', description: 'test5', count: 5 },
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
    setNewRoom({ title: '', description: '', youtubeLink: '' });
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                방 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newRoom.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                방 설명
              </label>
              <textarea
                id="description"
                name="description"
                value={newRoom.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700">
                YouTube 링크
              </label>
              <input
                type="url"
                id="youtubeLink"
                name="youtubeLink"
                value={newRoom.youtubeLink}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
          key={room.roomId}
          onClick={() => {
            handleNavigate(room.roomId);
          }}
          className="mb-4 flex flex-col rounded-md bg-zinc-900 p-4"
        >
          <img src="placeholder.jpg" alt={room.name} className="mb-3 h-40 w-full object-cover" />
          <div className="flex w-full justify-between">
            <p>{room.roomName}</p>
            <p>{room.count}명 시청중</p>
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

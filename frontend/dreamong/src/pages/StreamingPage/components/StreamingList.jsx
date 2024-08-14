import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import Button from '../../../components/Button';

import { useRecoilValue } from 'recoil';
import { userState, baseURLState } from '../../../recoil/atoms';

Modal.setAppElement('#root');

const StreamingList = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ title: '', youtubeLink: '' });

  const isAdmin = useRecoilValue(userState).role === 'ADMIN' ? true : false;
  const baseURL = useRecoilValue(baseURLState);

  // 방 목록 업데이트
  useEffect(() => {
    fetchRooms();
  }, []);

  // 방 목록 가져오기 함수
  const fetchRooms = () => {
    axios({
      method: 'get',
      url: `${baseURL}/rooms`, // 백엔드 api 명세 관련 논의 후 수정 예정
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        withCredentials: true,
      },
    })
      .then((response) => {
        if (response.status === 204) {
          setRooms([]);
          console.log('스트리밍방 목록이 비어 있습니다.');
        } else {
          setRooms(response.data.data);
          console.log('스트리밍방 목록 fetch 완료!');
        }
      })
      .catch((error) => {
        console.error('방 목록 조회 중 오류 발생', error);
        alert('방 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
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

  // 방 생성 모달 input 입력 값 -> state에 반영
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRoom = (event) => {
    event.preventDefault();
    // 방 생성 API 호출
    axios({
      method: 'post',
      url: `${baseURL}/rooms`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      data: {
        title: newRoom.title,
        youtubeLink: newRoom.youtubeLink,
        thumbnail: `https://img.youtube.com/vi/${extractVideoId(newRoom.youtubeLink)}/0.jpg`,
      },
    })
      .then((response) => {
        fetchRooms();
        toggleModalIsOpen();
        console.log('방 생성 성공!');

        setNewRoom({ title: '', youtubeLink: '' });
        console.log('newRoom State 초기화 완료');
      })
      .catch((error) => {
        console.error(error);
        alert('방 생성에 실패했습니다. 나중에 다시 시도해 주세요.');
      });
  };

  const handleDeleteRoom = (event, selectedRoomId) => {
    event.preventDefault();
    event.stopPropagation();
    axios({
      method: 'delete',
      url: `${baseURL}/rooms/${selectedRoomId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        setRooms(
          rooms.filter((room) => {
            return room.roomId !== selectedRoomId;
          }),
        );
        alert('선택하신 방이 성공적으로 삭제되었습니다!');
      })
      .catch((error) => {
        console.error('방 삭제 실패!', error);
        alert('방 삭제 실패!');
      });
  };

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
                className="focus:ring-primary-200 mt-1 block w-full rounded-md border-[1px] border-gray-200 p-2 text-base text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
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
                className="focus:ring-primary-200 mt-1 block w-full rounded-md border-[1px] border-gray-200 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
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

      {isAdmin && (
        <Button variant="primary" size="lg" fullWidth={true} className="my-3" onClick={toggleModalIsOpen}>
          방 생성하기
        </Button>
      )}

      {rooms && rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room.roomId} className="flex flex-col">
            <button
              onClick={() => handleNavigate(room.roomId)}
              className="mb-4 flex h-full w-full flex-col rounded-lg bg-slate-700 bg-opacity-50 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter"
            >
              <img src={room.thumbnail} alt={room.title} className="mb-3 h-48 w-full rounded-md object-cover" />
              <div className="mb-3 flex w-full justify-between">
                <p className="max-w-[60%] truncate">{room.title}</p>
                <p>{room.participantCount}명 시청중</p>
              </div>
            </button>
            {isAdmin && (
              <div className="mb-3 flex justify-end">
                <Button variant="danger" onClick={(event) => handleDeleteRoom(event, room.roomId)}>
                  방 삭제하기
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="mb-4 flex h-full w-full flex-col rounded-lg bg-black bg-opacity-50 bg-clip-padding p-4 backdrop-blur-sm backdrop-filter">
          <p>아직 방이 생성되지 않았습니다.</p>
          <p>관리자에게 문의해 주세요!</p>
        </div>
      )}
    </section>
  );
};

export default StreamingList;

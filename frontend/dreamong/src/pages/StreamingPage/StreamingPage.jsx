import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '../../components/Button';

const StreamingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const toggleModalIsOpen = () => {
    setModalIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    setRooms([
      { id: 1, name: '지브리 OST 모음짐', count: 25 },
      { id: 2, name: '자면서 듣는 재즈 음악', count: 43 },
      { id: 3, name: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요', count: 132 },
      { id: 4, name: '오늘 하루 고생한 당신을 위한 힐링 음악', count: 24 },
      { id: 5, name: '마하반야바라밀다심경 관자재보살...', count: 5 },
    ]);
  }, []);

  return (
    <div className="h-screen bg-black p-2">
      <Modal isOpen={modalIsOpen} ariaHideApp={false} onRequestClose={toggleModalIsOpen}>
        아직 모달에 들어갈 내용을 채우지 않았습니다.
      </Modal>
      <section className="flex justify-end">
        <Button size="md" className="text-white hover:text-gray-300" onClick={toggleModalIsOpen}>
          취침모드 설정
        </Button>
      </section>
      <section className="flex flex-col text-white">
        {rooms.map((room) => {
          return (
            <button key={room.id} className="mb-4 flex flex-col rounded-md bg-zinc-900 p-4">
              <img src="placeholder.jpg" alt={room.name} className="mb-3 h-40 w-full object-cover" />
              <div className="flex w-full justify-between">
                <p>{room.name}</p>
                <p>{room.count}명 시청중</p>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};

export default StreamingPage;

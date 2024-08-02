import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '../../components/Button';
import { Outlet } from 'react-router-dom';

// Make sure to set the app element for accessibility
Modal.setAppElement('#root');

const StreamingPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContentVisible, setModalContentVisible] = useState(false);

  const toggleModalIsOpen = () => {
    if (!modalIsOpen) {
      setModalIsOpen(true);
      setTimeout(() => setModalContentVisible(true), 50);
    } else {
      setModalContentVisible(false);
      setTimeout(() => setModalIsOpen(false), 300);
    }
  };

  const handleSleepTimeSave = () => {
    toggleModalIsOpen();
  };

  return (
    <div className="h-full p-2">
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
          <h2 className="mb-4 text-center text-2xl font-bold">취침모드 설정</h2>
          {/* 취침 시간 선택 코드 들어갈 부분 */}
          <div className="flex justify-end">
            <Button variant="secondary" size="md" onClick={toggleModalIsOpen} className="mx-2">
              취소
            </Button>
            <Button variant="primary" size="md" onClick={handleSleepTimeSave}>
              저장
            </Button>
          </div>
        </div>
      </Modal>

      <section className="flex justify-end">
        <Button size="md" className="text-white hover:text-gray-300" onClick={toggleModalIsOpen}>
          취침모드 설정
        </Button>
      </section>
      <Outlet />
    </div>
  );
};

export default StreamingPage;

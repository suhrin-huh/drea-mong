import { useState } from 'react';
import Button from '../components/Button';

const StreamingPage = () => {
  const [rooms, setRooms] = useState([]);

  return (
    <main className="h-screen bg-black p-4">
      <section className="flex justify-end">
        <Button size="lg" className="text-white hover:text-gray-300">
          취침모드 설정
        </Button>
      </section>
      <section>{rooms.map((room, idx) => {})}</section>
    </main>
  );
};

export default StreamingPage;

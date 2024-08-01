import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { OpenVidu } from 'openvidu-browser';
import YouTube from 'react-youtube';
import axios from 'axios';

import { useRecoilValue } from 'recoil';
import { getStreamingRoomById } from '../../../recoil/selectors';

const StreamingRoom = () => {
  const { roomId } = useParams();
  const getRoomById = useRecoilValue(getStreamingRoomById);
  const room = getRoomById(roomId);

  return (
    <section className="mx-2">
      <div className="mb-10">
        <div className="my-5 h-80 w-full rounded-md bg-slate-600 text-white">영상 재생 화면</div>
        <div className="flex w-full justify-between text-white">
          <p>{room.roomName}</p>
          <p>{room.count}명 시청중</p>
        </div>
      </div>
      <div className="h-screen rounded-t-lg bg-slate-700"></div>
    </section>
  );
};

export default StreamingRoom;

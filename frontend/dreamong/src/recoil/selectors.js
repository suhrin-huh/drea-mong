import { selector } from 'recoil';
import { streamingRoomsState } from './atoms';

export const getStreamingRoomById = selector({
  key: 'getStreamingRoomById',
  get:
    ({ get }) =>
    (id) => {
      const rooms = get(streamingRoomsState);
      return rooms.find((room) => room.roomId === parseInt(id));
    },
});

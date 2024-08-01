import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: {
    userId: 1,
    email: '',
    nickname: '',
    role: '',
  },
});

export const streamingRoomsState = atom({
  key: 'streamingRoomsState',
  default: [
    { roomId: 1, roomName: '지브리 OST 모음짐', description: 'test1', count: 25 },
    { roomId: 2, roomName: '자면서 듣는 재즈 음악', description: 'test2', count: 43 },
    { roomId: 3, roomName: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요', description: 'test3', count: 132 },
    { roomId: 4, roomName: '오늘 하루 고생한 당신을 위한 힐링 음악', description: 'test4', count: 24 },
    { roomId: 5, roomName: '마하반야바라밀다심경 관자재보살...', description: 'test5', count: 5 },
  ],
});

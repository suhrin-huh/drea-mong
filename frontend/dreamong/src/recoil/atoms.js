import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: {
    userId: 1,
    email: '',
    nickname: '',
    role: 'ADMIN',
  },
});

export const isListeningState = atom({
  key: 'isListeningState',
  default: false,
});

export const baseURLState = atom({
  key: 'baseURLState',
  default: 'http://localhost:8080',
});

export const socketURLState = atom({
  key: 'socketURLState',
  default: 'https://localhost:9093',
});

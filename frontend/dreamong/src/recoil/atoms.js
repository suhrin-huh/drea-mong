import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: {},
});

export const isListeningState = atom({
  key: 'isListeningState',
  default: false,
});

export const baseURLState = atom({
  key: 'baseURLState',
  default: 'https://i11c106.p.ssafy.io/api',
});

export const socketURLState = atom({
  key: 'socketURLState',
  default: 'wss://i11c106.p.ssafy.io/',
});

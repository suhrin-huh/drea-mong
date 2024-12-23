import { atom } from 'recoil';
import { replaceDateType } from '../../utils/formatter';

export const dateState = atom({
  key: 'dateState',
  default: replaceDateType(new Date()),
});

export const contentState = atom({
  key: 'contentState',
  default: '',
});

export const interpState = atom({
  key: 'interpState',
  default: '',
});

export const imageState = atom({
  key: 'imageState',
  default: '',
});

export const isSharedState = atom({
  key: 'isSharedState',
  default: false,
});

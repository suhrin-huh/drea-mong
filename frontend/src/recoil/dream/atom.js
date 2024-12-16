import { atom } from 'recoil';
import { replaceDateType } from '../../utils/formatter';

export const dateState = atom({
  key: 'dateState',
  default: replaceDateType(new Date()),
});

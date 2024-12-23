import { selector } from 'recoil';
import { dateState, contentState } from './atom';

export const formattedDateState = selector({
  key: 'formattedDateState',
  get: ({ get }) => {
    const date = get(dateState);
    const yyyymmdd = date.replace(/-/g, '');
    return yyyymmdd;
  },
});

export const contentValidation = selector({
  key: 'contentValidation',
  get: ({ get }) => {
    /** 꿈 일기 최소, 최대 길이 # MIN_LENGTH, MAX_LENGTH */
    const MIN_LENGTH = 25;
    const MAX_LENGTH = 500;
    const content = get(contentState);
    const length = content.length;

    const isLengthValid = () => {
      switch (true) {
        case content.replace(/ /g, '') == '':
          return 'blank';
        case length < MIN_LENGTH:
          return 'short';
        case length > MAX_LENGTH:
          return 'long';
        default:
          return 'valid';
      }
    };

    return isLengthValid();
  },
});

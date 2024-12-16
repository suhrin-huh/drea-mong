import { selector } from 'recoil';
import { dateState } from './atom';

export const formattedDateState = selector({
  key: 'formattedDateState',
  get: ({ get }) => {
    const date = get(dateState);
    const yyyymmdd = date.replace(/-/g, '');
    return yyyymmdd;
  },
});

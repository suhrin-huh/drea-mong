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
    {
      token: 1,
      title: '지브리 OST 모음짐',
      youtubeLink: 'https://www.youtube.com/watch?v=U34kLXjdw90&ab_channel=SoothingPianoRelaxing',
      thumbnailImg: '',
      participantCount: 25,
    },
    { token: 2, title: '자면서 듣는 재즈 음악', youtubeLink: 'test2', thumbnailImg: '', participantCount: 43 },
    {
      token: 3,
      title: '돈 복 들어오는 꿈 꾸고 싶으면 들어와요',
      youtubeLink: 'test3',
      thumbnailImg: '',
      participantCount: 132,
    },
    {
      token: 4,
      title: '오늘 하루 고생한 당신을 위한 힐링 음악',
      youtubeLink:
        'https://www.youtube.com/watch?v=p2fxv3PAtLU&ab_channel=%ED%9E%90%EB%A7%81%ED%8A%B8%EB%A6%AC%EB%AE%A4%EC%A7%81HealingTreeMusic%26Sounds',
      thumbnailImg: '',
      participantCount: 24,
    },
    {
      token: 5,
      title: '마하반야바라밀다심경 관자재보살...',
      youtubeLink: 'test5',
      thumbnailImg: '',
      participantCount: 5,
    },
  ],
});

export const isListeningState = atom({
  key:'isListeningState',
  default:false
})
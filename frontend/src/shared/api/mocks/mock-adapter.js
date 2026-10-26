import { AxiosError, AxiosHeaders, CanceledError } from 'axios';
import sampleImage from './assets/dream-sample.jpg';

const now = new Date();
const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
const user = { userId: 1, nickname: '꿈꾸는 몽이', email: 'demo@example.com', role: 'ADMIN' };
let dreams = Array.from({ length: 15 }, (_, index) => ({
  dreamId: index + 1,
  userId: 1,
  content: [
    '별이 가득한 바다 위를 걸으며 오랜 친구와 이야기를 나누었다.',
    '구름 사이에 떠 있는 도서관에서 하늘을 나는 책을 발견했다.',
    '초록빛 숲속에서 고양이를 따라가니 작은 정원이 나타났다.',
  ][index % 3],
  summary: ['별빛 바다를 걷는 꿈', '하늘 도서관을 여행하는 꿈', '숲속 정원을 발견하는 꿈'][index % 3],
  image: sampleImage,
  interpretation: '새로운 경험과 편안한 관계를 바라는 마음을 떠올려 볼 수 있는 꿈이에요. 오늘의 감정을 기록해 보세요.',
  shared: index % 3 !== 0,
  writeTime: `${month}${String(index + 1).padStart(2, '0')}`,
  dreamType: index % 2 ? '생생한 꿈' : '일반',
}));
let comments = [
  {
    id: 1,
    dreamId: 2,
    userId: 2,
    nickname: '별빛 여행자',
    content: '저도 이런 꿈을 꾸고 싶어요!',
    likesCount: 2,
    likedByUser: false,
  },
];
let rooms = [
  {
    roomId: 1,
    title: '별빛 아래 함께 쉬어요',
    youtubeLink: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    thumbnail: sampleImage,
    participantCount: 1,
  },
];
const nextIds = { dream: 16, comment: 2, room: 2 };
const allocateId = (type) => {
  const id = nextIds[type];
  nextIds[type] += 1;
  return id;
};

// 앱을 새로고침하면 초기화되는 메모리 저장소. 서버 권한 검증을 대체하지 않는다.
export default async function mockAdapter(config) {
  await new Promise((resolve) => {
    setTimeout(resolve, 120);
  });
  if (config.signal?.aborted) throw new CanceledError(undefined, config);
  const method = config.method.toLowerCase();
  const path = config.url;
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const params = config.params || {};
  const response = (data = null, status = 200, result = 'success', headers = {}) => ({
    data: { status: result, data: JSON.parse(JSON.stringify(data)) },
    status,
    statusText: String(status),
    headers: new AxiosHeaders(headers),
    config,
  });
  const fail = (status, code) => {
    const res = response(null, status, 'error');
    res.data.error = { code, message: '요청한 목 데이터를 처리할 수 없습니다.' };
    throw new AxiosError(code, AxiosError.ERR_BAD_REQUEST, config, undefined, res);
  };
  const findDream = (id) => dreams.find((item) => item.dreamId === Number(id)) || fail(404, 'DREAM_NOT_FOUND');

  if (path === '/auth/refresh') return response(null, 200, 'success', { authorization: 'Bearer mock-demo-session' });
  if (path === '/users/info') return response(user);
  if (path === '/users/logout') return response();
  if (path === '/users/nickname') {
    if (!body.nickname?.trim()) return fail(400, 'INVALID_NICKNAME');
    user.nickname = body.nickname.trim();
    return response();
  }
  if (path === '/dream/create' || path === '/dream/temporary') {
    dreams.push({
      ...body,
      dreamId: allocateId('dream'),
      userId: user.userId,
      shared: Boolean(body.isShared),
      summary: body.content?.slice(0, 40) || '',
      dreamType: '일반',
    });
    return response();
  }
  let match = path.match(/^\/dream\/(\d+)\/(\d{8})$/);
  if (match && method === 'get') {
    const owned = dreams.filter((item) => item.userId === Number(match[1]));
    return response({
      dreamMainResponsesList: owned
        .filter((item) => item.writeTime.startsWith(match[2].slice(0, 6)))
        .sort((a, b) => b.writeTime.localeCompare(a.writeTime)),
      totalCount: owned.length,
    });
  }
  match = path.match(/^\/dream\/(\d+)$/);
  if (match) {
    const dream = findDream(match[1]);
    if (method === 'get') return response(dream);
    if (method === 'put') {
      Object.assign(dream, body, { shared: Boolean(body.isShared) });
      return response();
    }
    if (method === 'delete') {
      dreams = dreams.filter((item) => item !== dream);
      comments = comments.filter((item) => item.dreamId !== dream.dreamId);
      return response();
    }
  }
  if (path === '/square/dreams')
    return response(
      dreams
        .filter((item) => item.shared && (!params.cursorId || item.dreamId < Number(params.cursorId)))
        .sort((a, b) => b.dreamId - a.dreamId)
        .slice(0, Number(params.size) || 10),
    );
  match = path.match(/^\/square\/(\d+)$/);
  if (match)
    return response({
      ...findDream(match[1]),
      comments: comments
        .filter((item) => item.dreamId === Number(match[1]))
        .map((item) => ({
          ...item,
          nickname: item.userId === user.userId ? user.nickname : item.nickname,
          commentOwner: item.userId === Number(params.userId),
        })),
    });
  if (path === '/comments/create') {
    findDream(body.dreamId);
    if (!body.content?.trim()) return fail(400, 'INVALID_COMMENT');
    comments.push({ ...body, id: allocateId('comment'), userId: user.userId, likesCount: 0, likedByUser: false });
    return response();
  }
  match = path.match(/^\/comments\/(\d+)\/(\d+)\/like$/);
  if (match) {
    const comment = comments.find((item) => item.id === Number(match[2]));
    if (!comment) return fail(404, 'COMMENT_NOT_FOUND');
    comment.likedByUser = !comment.likedByUser;
    comment.likesCount += comment.likedByUser ? 1 : -1;
    return response(null, 200, comment.likedByUser ? 'like' : 'unLike');
  }
  match = path.match(/^\/comments\/(\d+)$/);
  if (match && method === 'delete') {
    if (!comments.some((item) => item.id === Number(match[1]))) return fail(404, 'COMMENT_NOT_FOUND');
    comments = comments.filter((item) => item.id !== Number(match[1]));
    return response();
  }
  match = path.match(/^\/statistics\/(\d+)\/(\d{6})$/);
  if (match) {
    const selected = dreams.filter((item) => item.userId === Number(match[1]) && item.writeTime.startsWith(match[2]));
    return response({
      userId: Number(match[1]),
      objects: selected.length ? [{ word: '별', hashTags: ['#여행', '#기대', '#휴식'] }] : [],
      characters: selected.length ? [{ word: '친구', type: 'character' }] : [],
      locations: selected.length ? [{ word: '숲', type: 'location' }] : [],
      moods: selected.length ? [{ word: '편안함', type: 'mood' }] : [],
      dreamTypeCounts: ['일반', '생생한 꿈'].map((type) => ({
        dreamType: type,
        count: selected.filter((item) => item.dreamType === type).length,
      })),
    });
  }
  if (path === '/api/generate-image') return response([sampleImage]);
  if (path === '/api/generate-interpretation')
    return response(
      '꿈속의 장면에는 새로운 경험에 대한 기대가 담겨 있을 수 있어요. 가장 인상 깊었던 감정을 기록해 보세요.',
    );
  if (path === '/rooms') {
    if (method === 'get') return response(rooms);
    if (method === 'post') {
      rooms.push({ ...body, roomId: allocateId('room'), participantCount: 1 });
      return response(null, 201);
    }
  }
  match = path.match(/^\/rooms\/(\d+)$/);
  if (match) {
    const room = rooms.find((item) => item.roomId === Number(match[1]));
    if (!room) return fail(404, 'ROOM_NOT_FOUND');
    if (method === 'get') return response(room);
    if (method === 'delete') {
      rooms = rooms.filter((item) => item !== room);
      return response();
    }
  }
  // 미구현 요청이 실제 서버로 빠져나가지 않도록 명시적으로 실패한다.
  return fail(501, 'MOCK_ENDPOINT_NOT_IMPLEMENTED');
}

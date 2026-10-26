# 드리-몽 Frontend

React 18, Vite, React Router, Recoil, Tailwind 기반의 프론트엔드다.

## 실행

```sh
npm ci
npm run dev
```

기존 Sass 설치 변경이 포함된 작업 트리를 기준으로 검증했다. 서버·OAuth·Firebase 설정이 별도로 필요하며, 파일 구조 개편은 API·인증 동작을 변경하지 않는다.

```sh
npm run build
npm run preview
npm run lint
node scripts/check-structure.mjs
```

명령은 `frontend`에서 실행한다. `build`는 PWA 서비스 워커까지 생성한다. `dist`, `dev-dist`, `node_modules`는 생성물로 관리한다.

## FSD 구조

```text
src/
├── app/
│   ├── providers/        # RecoilRoot, BrowserRouter
│   ├── routes/           # lazy 라우트 조립
│   ├── ui/               # 앱 레이아웃·내비게이션
│   └── styles/           # 전역 스타일
├── pages/
│   ├── home/
│   ├── login/
│   ├── auth-callback/
│   ├── dream/            # 작성·편집 화면
│   ├── square/           # 목록·상세 화면
│   ├── streaming/        # 부모 레이아웃·목록·방 화면
│   ├── statistics/
│   ├── settings/
│   └── error/
├── features/
│   ├── dream-editor/     # 작성·편집 공용 입력·생성·공유·음성 UI
│   └── manage-notifications/
├── entities/
│   ├── user/             # 공용 사용자 상태
│   └── dream/            # 날짜 형식·길이 제약
├── shared/
│   ├── api/
│   ├── config/
│   ├── lib/
│   ├── ui/
│   └── assets/
└── main.jsx
```

의존 순서는 `app → pages → features → entities → shared`다. widgets는 필요할 때 추가한다. 같은 계층의 다른 slice를 import하지 않는다. app과 shared는 slice가 없는 계층이다.

각 slice의 외부 사용자는 `index.js` 공개 API를 사용한다. slice 내부에서는 상대 경로로 구체적인 파일을 참조하며 자기 공개 API를 역참조하지 않는다.

```js
// 다른 slice에서 사용
import { userState } from '@/entities/user';
import { DreamContentInput } from '@/features/dream-editor';

// 동일 slice 내부에서 사용
import { isListeningState } from '../model/speech.atoms';
```

`@/`는 `src/` alias다. Vite, jsconfig, ESLint resolver에서 같은 경로를 사용한다. shared의 공용 UI/라이브러리는 필요한 모듈 단위로 공개한다. 페이지의 전용 UI·통신 코드는 실제 재사용 또는 책임 분리가 필요할 때 하위 계층으로 추출한다.

## 파일과 자산 명명

- 폴더와 일반 JS·이미지·CSS는 소문자 kebab-case를 사용한다.
- React 컴포넌트는 PascalCase.jsx이며 파일명과 기본 export 이름을 일치시킨다.
- 화면은 Page, 부모 레이아웃은 Layout, 로딩 스켈레톤은 Skeleton 접미사를 사용한다.
- hook은 usePascalCase.js, 상태는 의미.atoms.js, API는 도메인.api.js로 명명한다.
- 대표 컴포넌트는 default export, 공개 API·hook·상태·함수·상수는 named export를 사용한다.
- 변수와 props는 camelCase, 모듈 상수는 UPPER_SNAKE_CASE로 명명한다.
- `index.js`, `Dockerfile` 등 도구·설계 규약 이름은 유지한다.

자산은 소유 slice를 먼저 정하고 용도별로 배치한다.

| 용도 | 위치 |
| --- | --- |
| 앱 공용 배경 | `shared/assets/backgrounds/` |
| 로그인 로고 | `pages/login/assets/logos/` |
| 오류 삽화 | `pages/error/assets/illustrations/` |
| 꿈 편집 이미지 생성 UI | `features/dream-editor/assets/images/` |
| 설정·스트리밍 아이콘 | 해당 page의 `assets/icons/` |
| 홈 더미 이미지 | `pages/home/model/assets/` |
| favicon·PWA·오프라인 HTML·서비스 워커 | `public/` |

`google-logo.svg`, `censored-image.png`처럼 대상과 역할을 표현한다. src 이미지는 import하고 `/src/...` 문자열 URL을 사용하지 않는다. 이미지와 JSX 컴포넌트·더미 데이터는 같은 assets 폴더에 넣지 않는다.

public은 고정 URL이 필요할 때 사용한다. 이름을 바꾸면 HTML, Vite manifest, 서비스 워커의 참조도 함께 갱신해야 한다.

## 설정과 레거시

현재 API/소켓 URL 상태는 `shared/config/server.atoms.js`에 있다. 사용자 상태와 음성 상태의 기존 Recoil key, 스토리지 key, 공개 URL은 유지했다.

공용 백엔드 Axios instance는 `shared/api/http-client.js`다. baseURL은 `VITE_API_BASE_URL`, 미설정 시 기존 `VITE_BASE_URL`을 사용한다. Vite 환경변수 변경 후에는 개발 서버를 재시작한다. API 호출부 이관과 빈 Firebase 설정·VAPID key 정리는 후속 작업이다.

```js
import api from '@/shared/api/http-client';

const response = await api.post('/dream/create', payload);

const form = new FormData();
form.append('file', file);
await api.post('/files', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
}); // 사용 예시 경로. 실제 업로드 endpoint에 맞춰 사용한다.

await api.post('/example', 'text', {
  headers: { 'Content-Type': 'text/plain' },
});
```

요청마다 localStorage의 `accessToken`이 있으면 Bearer 헤더를 붙이고 cookie 전송을 허용한다. 외부 서비스는 별도 client를 사용한다. 기본 Content-Type은 `application/json`이며 요청 config의 `headers['Content-Type']`으로 덮어쓸 수 있다. 파일을 FormData로 보낼 때는 위 예시처럼 `multipart/form-data`를 지정한다. multipart boundary는 Axios와 브라우저가 처리한다.

성공은 원래 AxiosResponse, 실패는 원래 오류를 reject한다. 응답 body 추출·오류 UI·로그인 이동은 호출부가 처리하며 자동 refresh·재시도·mock 연결은 없다.

업무별 API 선언은 `shared/api/modules/*.api.js`에서 default export한다. 마지막 인자는 선택적 Axios config이며 `signal`, `headers` 등을 전달할 수 있다. 현재는 선언만 분리한 단계로 기존 페이지 연결은 후속 작업이다.

```js
import dreamsApi from '@/shared/api/modules/dreams.api';
import squareApi from '@/shared/api/modules/square.api';

const response = await dreamsApi.getMonthlyDreams(userId, '20261001', { signal });
const dreams = response.data.data;
await dreamsApi.createDream(payload, { signal });
await squareApi.getDreams({ cursorId: 20, size: 10 }, { signal });
```

모듈은 날짜 형식 변환·성공 status 판정·204 변환·refresh token 추출을 수행하지 않는다. `roomsApi.getRooms()`의 204, 댓글 좋아요의 `response.data.status`, refresh의 `response.headers.authorization`도 호출부에서 처리한다. square 모듈의 query는 전용 인자로 전달한다. OAuth URL 생성·외부 알림 HTTP는 이번 모듈 분리 범위에 포함하지 않는다.

`archive/streaming`은 이전 OpenVidu/WebRTC 실험 코드이며 실행·lint·구조 검사 대상이 아니다. 상위 `.gitignore`의 `lib/` 규칙에 대해서는 `src/**/lib`만 예외 처리했다.

## 구조 검사와 검증 범위

`node scripts/check-structure.mjs`는 JS/JSX의 정적 import·문자열 dynamic import·재export를 ESLint parser로 읽어 다음을 확인한다.

- 실제 파일 존재 여부와 대소문자 일치
- 계층 의존 방향과 같은 계층 slice의 격리
- slice 공개 API와 자기 index 역참조
- 순환 의존과 wildcard 재export
- 폴더·파일·컴포넌트 기본 export 명명
- manifest·서비스 워커·HTML에서 참조하는 public 이미지

임의의 런타임 URL이나 서버 동작을 검증하는 도구는 아니다. 구조 위반 사례 6종을 임시로 삽입해 검출 여부도 확인했다.

2026-10-22 검증 결과:

- 프로덕션/PWA 빌드와 구조 검사 통과.
- Chrome 모바일 뷰에서 공개 화면, 이미지 로딩과 비로그인 전환을 13개 경로로 확인. 런타임 예외·HTTP 자산 실패 없음.
- 실제 API 요청은 차단한 검사다. 서버 CRUD, OAuth 성공, 채팅 동기화, 푸시 수신은 검증하지 않았다.
- lint는 오류 341건·경고 78건으로 실패한다. 기존 코드의 props 검증·접근성·미사용 변수·미정의 참조 및 패키지 resolver 문제 등이 남아 있다. 새 Provider/Layout의 children props 검증도 후속 정리 대상이다.

상세 이동 내역과 기존 문제는 [개편 계획서](../docs/frontend-restructure-plan.md)를 참고한다.

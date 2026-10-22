# Frontend 폴더 구조 및 명명규칙 개편 계획

작성일: 2026-10-22. 현재 작업 트리 기준이며 구현 전 검토 문서이다.

## 1. 조사 범위와 현재 상태

- `frontend`의 소스·설정·문서·정적 자원·추적 중인 개발 산출물 **80개 파일**을 확인했다. 텍스트 파일은 내용과 참조를 확인했고, 이미지/SVG는 파일 종류·크기·사용 경로를 조사했다. 이미지의 시각적 품질 평가는 이번 범위에 포함하지 않는다.
- `node_modules`는 외부 의존성이므로 개편 대상에서 제외했다. 검증 중 생성된 `dist`도 원본 파일 목록에서 제외했다. lockfile은 의존성 메타데이터로 확인했다.
- React 18 + Vite + JavaScript/JSX + React Router + Recoil + Tailwind 구조다. Axios, Firebase/FCM, Socket.IO, YouTube, Chart.js를 사용한다.
- `App.jsx`에 레이아웃·라우팅·Provider·사용되지 않는 로그인 토글 상태가 모여 있다. 등록된 Route는 중첩 index와 wildcard를 포함해 14개다.
- 기능은 홈/꿈 일기 작성·편집/광장·댓글/스트리밍·채팅/통계/설정/로그인으로 구분된다.
- `frontend/README.md`는 비어 있다. 적용할 `AGENTS.md`는 조사한 프로젝트 및 상위 경로에서 발견하지 못했다.
- 조사 시작 전부터 `package.json`, `package-lock.json`이 수정된 상태였다. 기존 Sass 추가 변경은 보존한다.

검증 기준선:

| 검사 | 현재 결과 | 해석 |
| --- | --- | --- |
| `npm run build` | 성공, PWA 서비스 워커 빌드 포함 | 라우트에서 도달하는 모듈의 번들링 기준선 |
| `npm run lint` | 실패: 547건, 오류 466 / 경고 81 | 레거시·미사용 파일과 기존 코드 문제 포함. 개편으로 생긴 오류와 구분 필요 |
| 실제 로그인·서버 API·소켓·푸시 | 실행 검증하지 않음 | 빌드 성공을 기능 정상 작동으로 판단하지 않음 |

## 2. 개편이 필요한 이유

1. **폴더 배치 기준이 혼재한다.** 홈/로그인/스트리밍은 `페이지명/페이지명.jsx`, 광장/통계/설정은 `pages` 바로 아래, 꿈은 `DreamPage`에 두 화면이 있다.
2. **라우트 화면과 일반 컴포넌트 구분이 틀어진다.** `LoginSuccess`, `StreamingList`, `StreamingRoom`은 Route에 직접 연결되지만 `components` 안에 있다. `StreamingPage`는 `Outlet`을 가진 부모 레이아웃이다.
3. **스켈레톤이 실제 페이지처럼 분리돼 있다.** 라우트가 없는 `SkeletonPage`의 UI는 광장·통계 기능이 소유해야 한다.
4. **`assets`에 실행 코드가 섞여 있다.** `dummy.jsx`는 JSX 없는 데이터이고, `icons.jsx`는 아이콘뿐 아니라 Recoil에 의존하는 음성인식 버튼·오버레이·스크롤 버튼을 내보낸다.
5. **역할이 이름에 드러나지 않는다.** `utils/utils.js`, `UpperBar`, `ContentBox`, `SavaButton` 등은 검색과 역할 파악이 어렵다. `DreamDetailPage` 내부 함수명도 `DreamRegisterPage`이며 실제 동작은 편집이다.
6. **서버 설정과 UI 상태가 한 파일에 있다.** `atoms.js`의 URL atom은 변경되는 UI 상태와 성격이 다르다. 요청 코드는 공통 Axios와 개별 Axios 호출로 분산돼 있다.
7. **레거시가 활성 소스에 남아 있다.** WebRTC 파일은 현재 라우트에서 참조되지 않고, 없는 selector와 설치되지 않은 OpenVidu를 참조한다. `SavaButton`도 사용되지 않으며 없는 `contentState`를 import한다.
8. **파일 이동 시 import 외 경로도 영향을 받는다.** Tailwind 배경 URL, 더미 이미지 문자열, PWA manifest, 서비스 워커 알림 아이콘과 HTML 링크가 있다.

## 3. 확정 구조: 필요한 계층부터 FSD 도입

기존 3영역 제안을 FSD로 변경한다. 계층은 `app → pages → features → entities → shared`이며 widgets는 필요한 독립 화면 블록이 생길 때 추가한다. 기존 React/Recoil/JavaScript 스택과 공개 URL은 유지한다.

```text
src/
├── app/                        # App, providers, routes, ui, styles
├── pages/                      # home, login, auth-callback, dream, square,
│                               # streaming, statistics, settings, error
│   └── <slice>/                # ui, model, assets, index.js
├── features/
│   ├── dream-editor/           # 작성/편집 공용 입력·생성·공유 UI, 음성 상태
│   └── manage-notifications/   # 알림 설정과 FCM 연동
├── entities/
│   ├── user/model/            # 여러 화면이 참조하는 사용자 상태
│   └── dream/                 # 일기 날짜 변환·길이 제약
├── shared/
│   ├── api/                   # 공용 HTTP client
│   ├── config/                # 서버 URL 설정
│   ├── lib/error/             # 오류 처리 hook
│   ├── ui/                    # button, loading-spinner, icons
│   └── assets/backgrounds/    # 공용 앱 배경
└── main.jsx
```

### 의존 규칙

- 다른 slice는 더 낮은 계층만 참조한다. 같은 계층의 slice끼리 참조하지 않는다.
- slice 외부에서는 `index.js`의 명시적 공개 API만 사용한다. slice 내부는 상대 경로로 참조하며 자기 index를 역참조하지 않는다.
- app/shared는 slice가 없는 계층이다. shared의 UI·라이브러리는 필요한 모듈 단위의 공개 API를 둔다.
- dream 작성/편집, square 목록/상세, streaming 부모/목록/방은 각각 하나의 page slice에 배치해 불필요한 상호 의존을 피한다.
- 편집 행동에서 함께 사용하는 UI는 dream-editor 하나의 feature로 묶는다. 이미지 생성 feature와 해몽 feature로 나눈 뒤 feature끼리 import하는 구조는 만들지 않는다.
- 사용자 상태는 entities/user에 두어 페이지·feature에서 같은 계층을 역참조하지 않게 한다.
- 아직 분리할 책임이 없는 댓글·방 entity와 빈 widgets는 만들지 않는다. 페이지 전용 통신 코드는 이번에 전면 추출하지 않는다.

근거: [FSD 계층](https://feature-sliced.design/docs/reference/layers), [공개 API](https://feature-sliced.design/docs/reference/public-api).

## 4. 명명규칙과 자산 분류

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| slice·segment 폴더 | 소문자 kebab-case, segment는 역할 기준 | `dream-editor/ui`, `user/model` |
| React 컴포넌트 | PascalCase.jsx, 파일명·선언명 일치 | `DreamEditPage.jsx` |
| 화면·레이아웃·스켈레톤 | Page / Layout / Skeleton 접미사 | `StreamingLayout`, `SquareSkeleton` |
| hook | use + PascalCase.js | `useHandleError.js` |
| 상태·API·일반 JS | 의미.atoms.js / 도메인.api.js / kebab-case.js | `user.atoms.js`, `http-client.js` |
| 상수·변수·props | 상수 UPPER_SNAKE_CASE, 변수/props camelCase | `DREAM_MIN_LENGTH`, `maxLength` |
| 이미지·SVG·CSS | 소문자 kebab-case, 대상과 역할 표현 | `google-logo.svg`, `not-found.png` |
| export | 대표 컴포넌트 default, 공개 API는 명시적 named export | `export { default as HomePage } ...` |
| 규약 파일 | 표준명 유지 | `Dockerfile`, `README.md`, `index.js` |

자산은 확장자가 아닌 **소유 slice → 용도** 순으로 분류한다. 로그인 로고는 pages/login/assets/logos, 오류 삽화는 pages/error/assets/illustrations, 편집 이미지 생성 UI 자원은 features/dream-editor/assets/images, 설정/스트리밍 아이콘은 해당 page의 assets/icons에 둔다. 앱 배경은 shared/assets/backgrounds에 둔다. 한두 개만 있는 자원까지 불필요하게 계층을 늘리지 않는다.

`img`, `btn`, `BG`, `Test` 같은 임시·축약 표현과 대소문자 혼용을 제거한다. 더미 이미지는 home/model/assets에서 더미 데이터와 함께 관리한다. dummy.jsx는 .js 데이터로, icons.jsx는 실제 React UI로 분리한다. 미사용 이미지 6개와 public/vite.svg는 참조를 재확인하고 삭제한다.

public은 고정 URL을 가진 favicon·PWA·서비스 워커·오프라인 파일에 한정한다. PWA 아이콘도 kebab-case로 통일하고 manifest/SW 참조를 함께 갱신한다. src 자원은 import하여 빌드가 URL을 관리하도록 한다.

alias `@/`는 src에 대응한다. Vite/jsconfig/ESLint에서 일치시키며, 계층과 공개 API 위반은 별도 구조 검사로 확인한다. API 필드·스토리지 key·소켓 이벤트·Recoil key는 변경하지 않는다.

## 5. 전체 파일별 이동·수정 계획

총 80개이며 모든 경로는 frontend 기준이다. 아래 표는 기존 파일을 기준으로 작성했다. 분할되는 새 파일은 별도로 설명한다. 삭제 후보는 실제 적용 시 참조를 재확인한다.

| 현재 경로 | 권장 경로 / 조치 | 근거·주의사항 |
| --- | --- | --- |
| `src/main.jsx` | 유지 | App와 global.css import 갱신 |
| `src/App.jsx` | `src/app/App.jsx` | Provider, 라우트, 앱 레이아웃 분리 |
| `src/index.css` | `src/app/styles/global.css` | 기본 스타일 유지, 기능별 애니메이션은 후속 분리 |
| `src/components/Button.jsx` | `src/shared/ui/button/Button.jsx` | 공용 UI |
| `src/components/NavigationBar.jsx` | `src/app/ui/NavigationBar.jsx` | 라우트와 꿈 입력 모드에 의존하는 앱 UI |
| `src/recoil/atoms.js` | `entities/user/model/user.atoms.js`, `features/dream-editor/model/speech.atoms.js`, `shared/config/server.atoms.js` (src 기준) | 기존 atom key와 URL 값 보존 |
| `src/utils/api.js` | `src/shared/api/http-client.js` | 공통 Axios. 전체 API 호출 전환은 2차 |
| `src/utils/firebase.js` | `src/features/manage-notifications/lib/push-notifications.js` | FCM 초기화와 알림 구독 |
| `src/utils/utils.js` | `src/shared/lib/error/useHandleError.js` | Router hook을 포함하는 오류 처리 |
| `src/pages/MainPage/MainPage.jsx` | `src/pages/home/ui/HomePage.jsx` | 홈으로 이름 통일 |
| `src/pages/MainPage/components/DateSelector.jsx` | `src/pages/home/ui/MonthSelector.jsx` | 연월 선택 역할 명시 |
| `src/pages/MainPage/components/DreamList.jsx` | `src/pages/home/ui/DreamList.jsx` | 홈 전용 목록 |
| `src/pages/LoginPage/LoginPage.jsx` | `src/pages/login/ui/LoginPage.jsx` | 로그인 화면 |
| `src/pages/LoginPage/components/LoginSuccess.jsx` | `src/pages/auth-callback/ui/AuthCallbackPage.jsx` | 성공 표시보다 인증 callback 처리가 실제 역할 |
| `src/pages/LoginPage/components/FadeInText.jsx` | `src/pages/login/ui/FadeInText.jsx` | 로그인 전용 UI |
| `src/pages/DreamPage/DreamRegisterPage.jsx` | `src/pages/dream/ui/DreamCreatePage.jsx` | 작성 화면 |
| `src/pages/DreamPage/DreamDetailPage.jsx` | `src/pages/dream/ui/DreamEditPage.jsx` | 실제로 편집·업데이트. 내부 DreamRegisterPage 선언도 수정 |
| `src/pages/DreamPage/components/ContentBox.jsx` | `src/features/dream-editor/ui/DreamContentInput.jsx` | 내용 입력과 STT |
| `src/pages/DreamPage/components/DatePicker.jsx` | `src/features/dream-editor/ui/DreamDatePicker.jsx` | 과거 날짜 제한을 가진 도메인 UI |
| `src/pages/DreamPage/components/ImageGenerator.jsx` | `src/features/dream-editor/ui/DreamImageGenerator.jsx` | 이미지 생성과 선택 |
| `src/pages/DreamPage/components/InterpretationBox.jsx` | `src/features/dream-editor/ui/DreamInterpretationPanel.jsx` | 해몽 생성과 표시 |
| `src/pages/DreamPage/components/ShareSettings.jsx` | `src/features/dream-editor/ui/DreamShareToggle.jsx` | 공유 토글 |
| `src/pages/DreamPage/components/UpperBar.jsx` | `src/features/dream-editor/ui/DreamEditorHeader.jsx` | 뒤로가기·하단이 아닌 상단 저장/삭제 동작 |
| `src/pages/DreamPage/components/SavaButton.jsx` | 삭제 후보 | 삭제 후보: 미사용이며 없는 contentState 참조. 이름만 고쳐 남기지 않음 |
| `src/pages/SquarePage.jsx` | `src/pages/square/ui/SquarePage.jsx` | 광장과 cursor 페이지네이션 |
| `src/pages/SquareDetailPage.jsx` | `src/pages/square/ui/SquareDetailPage.jsx` | 공유 꿈·댓글·좋아요 |
| `src/pages/SkeletonPage/SquareSkeletonPage.jsx` | `src/pages/square/ui/SquareSkeleton.jsx` | 내부 DreamSquareSkeletonPage 선언도 일치시킴 |
| `src/pages/SkeletonPage/SquareDetailSkeletonPage.jsx` | `src/pages/square/ui/SquareDetailSkeleton.jsx` | 호출부 SkeletonSquareDetailPage 별칭도 통일 |
| `src/pages/StatisticsPage.jsx` | `src/pages/statistics/ui/StatisticsPage.jsx` | 통계 화면 |
| `src/pages/SkeletonPage/StatisticsSkeletonPage.jsx` | `src/pages/statistics/ui/StatisticsSkeleton.jsx` | 라우트가 없는 보조 UI |
| `src/pages/SkeletonPage/components/SkeletonBlock.jsx` | `src/pages/statistics/ui/SkeletonBlock.jsx` | 현재 통계만 사용 |
| `src/pages/SettingsPage.jsx` | `src/pages/settings/ui/SettingsPage.jsx` | 설정 화면 |
| `src/pages/ErrorPage.jsx` | `src/pages/error/ui/ErrorPage.jsx` | 404·일반 오류 동작 유지 |
| `src/pages/StreamingPage/StreamingPage.jsx` | `src/pages/streaming/ui/StreamingLayout.jsx` | Outlet·공통 헤더·취침 타이머 |
| `src/pages/StreamingPage/components/StreamingList.jsx` | `src/pages/streaming/ui/StreamingListPage.jsx` | index 라우트 화면 |
| `src/pages/StreamingPage/components/StreamingRoom.jsx` | `src/pages/streaming/ui/StreamingRoomPage.jsx` | 방 라우트 화면 |
| `src/pages/StreamingPage/components/legacy/StreamingList_WebRTC.jsx` | `archive/streaming/StreamingListWebRtc.jsx` | 현재 참조 없음. 비교용으로 보존하고 실행 대상에서 제외. 선언명도 파일명에 맞춤 |
| `src/pages/StreamingPage/components/legacy/StreamingRoom_WebRTC.jsx` | `archive/streaming/StreamingRoomWebRtc.jsx` | 현재 참조 없음. 비교용으로 보존하고 실행 대상에서 제외. 선언명도 파일명에 맞춤 |
| `src/assets/dummy.jsx` | `src/pages/home/model/home-dreams.mock.js` | JSX 없는 데이터. 현행 API 실패 fallback 유지, 이미지 문자열은 import로 변경 |
| `src/assets/icons.jsx` | 아래 16개 export 분할안 참고 | SVG·버튼·로딩·상태 의존 UI가 혼재 |
| `src/assets/background.svg` | `src/shared/assets/backgrounds/app-background.svg` | App 배경과 Tailwind URL 함께 갱신 |
| `src/assets/404.png` | `src/pages/error/assets/illustrations/not-found.png` | ErrorPage 사용 |
| `src/assets/500.png` | `src/pages/error/assets/illustrations/server-error.png` | ErrorPage 사용 |
| `src/assets/MainpageTest.jpg` | `src/pages/home/model/assets/dream-sample.jpg` | dummy의 이미지 문자열을 import로 치환 |
| `src/assets/censoredImg.png` | `src/features/dream-editor/assets/images/censored-image.png` | 검열된 이미지의 대체 이미지 |
| `src/assets/img_generator.png` | `src/features/dream-editor/assets/images/image-generator.png` | 이미지 생성 버튼 |
| `src/assets/back.svg` | `src/pages/streaming/assets/icons/back.svg` | 스트리밍 뒤로가기 |
| `src/assets/login.svg` | `src/pages/settings/assets/icons/login.svg` | 설정 화면 |
| `src/assets/logout.svg` | `src/pages/settings/assets/icons/logout.svg` | 설정 화면 |
| `src/assets/user.svg` | `src/pages/settings/assets/icons/user.svg` | 설정 화면 |
| `src/assets/logoSVG/btn_google.svg` | `src/pages/login/assets/logos/google-logo.svg` | 로그인 로고 |
| `src/assets/logoSVG/btn_naver.svg` | `src/pages/login/assets/logos/naver-logo.svg` | 로그인 로고 |
| `src/assets/logoSVG/btn_kakao.svg` | `src/pages/login/assets/logos/kakao-logo.svg` | 로그인 로고 |
| `src/assets/logoSVG/btn_apple.svg` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `src/assets/logoSVG/btn_gmail.svg` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `src/assets/detailBG.jpg` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `src/assets/react.svg` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `src/assets/send.svg` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `src/assets/test.jfif` | 삭제 후보 | 앱 내 참조 없음. 루트 README의 과거 구조도는 정리 필요 |
| `public/apple-touch-icon.png` | 유지 | 고정 공개 URL 유지. SW는 앱 기능 폴더로 옮기지 않음 |
| `public/drea-mong.svg` | 유지 | 고정 공개 URL 유지. SW는 앱 기능 폴더로 옮기지 않음 |
| `public/firebase-messaging-sw.js` | 유지 | 고정 공개 URL 유지. SW는 앱 기능 폴더로 옮기지 않음 |
| `public/offline.html` | 유지 | 고정 공개 URL 유지. SW는 앱 기능 폴더로 옮기지 않음 |
| `public/robots.txt` | 유지 | 고정 공개 URL 유지. SW는 앱 기능 폴더로 옮기지 않음 |
| `public/drea-mong_192px.png` | `public/drea-mong-192.png` | Vite manifest와 SW 알림 아이콘 참조 함께 갱신 |
| `public/drea-mong_512px.png` | `public/drea-mong-512.png` | Vite manifest와 SW 알림 아이콘 참조 함께 갱신 |
| `public/vite.svg` | 삭제 후보 | 템플릿 이미지, 앱 참조 없음 |
| `dev-dist/registerSW.js` | 생성물로 추적 해제·ignore | 직접 수정하지 않음 |
| `.eslintrc.cjs` | 루트 유지 | alias resolver, archive/dev-dist 제외, 설정파일·SW의 실행 환경별 override 정리 |
| `.prettierrc.json` | 루트 유지 | 기존 규칙 유지 |
| `.gitignore` | 루트 유지 | dev-dist 생성물 제외 추가 |
| `package.json` | 루트 유지 | 기존 사용자 변경 보존. alias resolver 등 필요한 개발 의존성만 추가 |
| `package-lock.json` | 루트 유지 | 기존 변경 보존. 의존성 변경 시 npm으로만 동기화 |
| `vite.config.js` | 루트 유지 | alias와 PWA 이미지 경로 갱신. proxy 동작 수정은 별도 |
| `tailwind.config.js` | 루트 유지 | src glob이 새 구조를 포함하므로 유지 |
| `postcss.config.js` | 루트 유지 | 표준 도구 설정으로 유지 |
| `index.html` | 루트 유지 | main.jsx 진입점 유지, public 링크 검증 |
| `Dockerfile` | 루트 유지 | 루트 유지, src 내부 이동은 COPY 경로에 영향 없음 |
| `nginx.conf` | 루트 유지 | 현행 Dockerfile은 serve 사용. 실제 배포 사용 여부 확인 전 삭제하지 않음 |
| `README.md` | 루트 유지 | 현재 빈 문서. 구조·명명·환경변수·실행·검증 절차 작성 |

### 혼재 UI·상태 분리

- Main/Square/Create/Streaming/Settings 아이콘은 라벨을 포함한 app/ui의 NavigationItem으로 분리한다.
- STTIcon, SttWaveBar, SaveBar는 dream-editor/ui의 SpeechInputButton, SpeechListeningOverlay, DreamSavingOverlay로 분리한다.
- StatisticsIcon, ArrowIcon, 사용 중인 재생성 아이콘은 shared/ui/icons의 개별 컴포넌트로 분리한다.
- 사용 중인 SmallLoadingSpinner는 shared/ui/loading-spinner로 분리한다. 미사용 LargeLoadingSpinner, SmallRegeneratorIcon, HeaderContent는 제거한다.
- ScrollButton은 home/ui/ScrollDownButton으로 옮긴다. JSX 상수 호출부는 컴포넌트 호출로 함께 변경한다.
- userState는 entities/user/model, isListeningState는 features/dream-editor/model에 둔다. 기존 key는 보존한다.
- URL atom은 shared/config에 위치시켜 기존 값을 보존한다. 전체 요청 client 통합과 환경변수 적용은 별도 동작 수정으로 남긴다.

## 6. 작업 단위와 범위

1. `docs: FSD 구조와 자산 분류 개편 계획 반영`: 계획·전체 파일 이동안 확정.
2. `refactor: FSD 계층과 공개 API로 소스 구조 정리`: 화면·feature·entity·공통 모듈 이동, App 분리, UI 분할, alias와 구조 검사 추가.
3. `refactor: 자산 이름과 용도별 배치 통일`: 자산 이름·경로·참조 갱신, 미사용 자원 및 미완성 저장 버튼 정리, 레거시 격리, 개발 생성물 추적 해제.
4. `docs: 개편 구조와 검증 결과 문서화`: README 갱신, 최종 검사 결과·제한사항 기록.

각 구현 단위는 빌드와 import/계층 검증 후 커밋한다. 실제 변경 크기에 따라 검증 도구 추가·보완을 별도 커밋으로 나눌 수 있다. 기존 package.json/package-lock.json의 사용자 변경은 보존하고 이번 커밋에 섞지 않는다.

이번 범위는 구조·명명·공개 API와 자산 참조 정리다. API 전면 통합, 인증 동작 변경, 기존 버그 전반 수정, 프레임워크 교체는 포함하지 않는다. 기능별 API/hook은 책임을 실제로 분리할 필요가 생길 때 추출한다.

## 7. 분석 중 발견한 기존 문제

다음은 개편의 효과로 해결됐다고 처리해서는 안 되는 별도 동작 문제다.

- `api.js`: `import.meta.VITE_BASE_URL`을 사용한다. `import.meta.env.VITE_BASE_URL`로 수정할 때는 기존 요청의 `api/` 접두사와 baseURL 조합까지 확인해야 한다.
- MainPage: 미정의 `etDreams`, `await api.get(...).data.data`의 Promise 접근 순서, 상태 갱신 직후 이전 user 참조가 있다. 오류가 dummy fallback으로 가려질 수 있다.
- DreamRegisterPage catch의 `err`, InterpretationBox의 `Navigate`는 미정의다. StreamingRoom은 `isScrollecToBottom`을 선언하고 `isScrolledToBottom`을 참조한다.
- ContentBox는 render 중 `window.webkitSpeechRecognition`을 생성한다. 비지원 브라우저와 이벤트 해제는 STT hook 추출 시 다뤄야 한다.
- SkeletonBlock의 `w-${width}` 등 동적 Tailwind 클래스는 명시적 클래스 맵 등으로 정리해야 한다. 파일 이동만으로 해결되지 않는다.
- Firebase 설정과 VAPID key가 비어 있어 실제 푸시 검증에는 설정이 필요하다. 알림 구독의 브라우저/서버 책임도 후속으로 확인한다.
- Vite의 server 옵션이 VitePWA 옵션 안에 있다. proxy 적용 위치 수정은 별도 동작 검증이 필요하다.
- PWA 빌드 출력은 `firebase-messaging-sw.mjs`인데 Nginx의 전용 location은 `/service-worker.js`다. 실제 등록 URL·scope·cache header를 확인해야 한다.
- SW에 offline/index를 캐시에 넣는 명시적 로직이 보이지 않고 injectionPoint도 비활성이다. 오프라인 동작은 별도 검증 대상이다.
- 루트 docker-compose.yml의 frontend context `./frontend/dreamong`은 현재 구조와 다르고, `5173:80`은 현재 serve의 5173 포트와 맞지 않는다. 배포 구성 수정은 독립적으로 다룬다.
- 일부 lint의 import 해석 오류는 패키지 export/resolver 설정 문제일 수 있으므로 모두 파일 부재로 단정하지 않는다. 반면 레거시의 selector와 OpenVidu는 실제로 현재 구성에 없다.

이동 시 특히 확인할 경로는 App의 Tailwind background URL, dummy의 `/src/assets/MainpageTest.jpg`, manifest 이미지, SW 알림 이미지, HTML favicon이다. public 파일은 외부에서 URL로 참조할 수 있어 코드 내 import 검색만으로 안전성을 판단하지 않는다.

## 8. 완료 조건과 검증

- 프로덕션/PWA 빌드 성공, 모든 정적·동적 import와 자산 참조 해석.
- 구조 검사: 계층 역참조·같은 계층 slice 참조·공개 API 우회·명명 위반이 없어야 한다.
- lint는 기존 오류 기준선과 비교하고, 기존 코드 오류·경고가 남으면 명시한다. archive 제외를 동작 수정으로 계산하지 않는다.
- 모든 공개 경로와 lazy page 경계를 유지한다. 로고·배경·스켈레톤·로더를 확인한다.
- 서버 인증이 필요한 CRUD·소켓·FCM은 설정 및 서버 접근 가능 여부에 따라 검증 한계를 기록한다.
- 이전 src/assets 문자열과 오래된 import를 제거하고, asset 파일명은 kebab-case로 통일한다.
- public 아이콘 manifest·SW 참조, 배포 산출물의 이미지 포함 여부를 확인한다.
- README에 FSD 계층·segment·공개 API·자산 배치·실행/검증 절차를 기록한다.

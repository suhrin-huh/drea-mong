# Frontend API 중앙 관리 및 Mock 적용 계획

작성일: 2026-10-22
최종 갱신: 2026-10-26
상태: API 호출부 이관 및 개발용 목 연결 구현, 브라우저·실제 서버 통합 검증 전

## 1. 목표와 현재 결정

백엔드 연결 전에도 서버 데이터를 사용하는 화면의 조회·변경 흐름을 개발할 수 있도록 공통 API 계층에 목을 연결한다. 페이지마다 샘플 데이터를 넣지 않고 같은 업무별 API 함수를 실제 서버와 목 모드에서 사용한다. 정적 페이지와 날짜 선택·폼 입력 같은 클라이언트 기능은 그대로 유지한다.

- 기존 React·Recoil·Axios를 유지한다. TanStack Query 도입은 별도 후속 작업이다.
- `shared/api/modules`는 업무별 default export를 제공하고 원본 AxiosResponse/AxiosError를 전달한다. 날짜 가공, `response.data.data` 처리와 화면 상태·이동은 호출부에 남긴다.
- 현재 목은 공용 Axios adapter에서 공급한다. `request.js`, 별도 runtime, 세션 Provider, 오류 정규화 계층은 추가하지 않았다.
- 개발 서버에서는 목을 기본 사용하고 `VITE_API_MOCK=false`로 실제 서버에 연결한다. 자동 fallback은 사용하지 않는다.
- 조회·작성·수정·삭제는 같은 메모리 저장소를 사용한다. 화면 이동 후 재조회에 반영되며 새로고침하면 초기화된다.
- 소유자·역할의 실제 검증은 백엔드 책임이다. 목은 화면 개발용이며 실제 보안 검증을 대체하지 않는다.

세부 호출 계약은 [Frontend API 구현 계약](./frontend-api-contract.md), 실행 방법은 [Mock API 사용 안내](../frontend/src/shared/api/mocks/README.md)를 함께 참고한다. 과거 계획과 충돌하는 항목은 이 문서의 현재 결정과 구현 계약을 우선한다.

## 2. 초기 계획과 달라진 사항

| 초기 제안 | 현재 구현·결정 | 후속 범위 |
| --- | --- | --- |
| live/fallback/mock 3모드, 개발 기본 fallback | 개발 기본 mock, 설정으로 live 전환 | 자동 fallback은 현재 도입하지 않음 |
| API 공급·인증 우회 각각 설정 | `isMockMode`와 `hasApiSession()`으로 최소 데모 접근 제공 | 독립 우회 flag·복수 프로필·세션 Provider는 필요 시 별도 설계 |
| DTO·void 반환 정규화 | 원본 Axios 응답·오류 유지 | Query 도입 시 필요한 소비 경계에서 응답 추출 |
| request/error/runtime와 endpoint별 handler 분리 | `mock-adapter.js`에 지연·라우팅·저장소 배치 | 시나리오와 복잡도가 늘어날 때 책임별 분리 |
| 전역 사용자 초기화·출처 generation·전환 UI | 기존 페이지 사용자 조회 유지, 서버 재시작·새로고침으로 모드 전환 | 실시간 전환과 세션 재설계는 미구현 |
| MEMBER/ADMIN/다른 작성자 프로필 | 고정 ADMIN 사용자 1명, 댓글에 다른 작성자 예시 | 역할별 화면·권한 오류 시나리오 후속 검증 |
| 여러 달·고정 날짜 주입·오류 설정 도구 | 초기화 시 현재 월 꿈 15개, 공유 꿈 10개, 120ms 지연 | 여러 달 fixture·고정 날짜 주입·오류/지연 제어 미구현 |
| AI 이미지 4개 및 검열 시나리오 | 로컬 이미지 1개와 고정 해몽 | 검열·실패·재생성 다양성 미구현 |
| 로그아웃으로 데모 세션 종료 | 로그인 화면 이동과 사용자 상태 초기화, 데모 접근은 유지 | 실제 세션 종료 모델은 미구현 |
| 모든 계획상 검증 완료 후 사용 | API 동작·빌드 검증 후 우선 화면 개발에 사용 | 브라우저·서버·인증·외부 연동 검증 별도 |

## 3. 구조와 책임

```text
src/shared/
├── config/api-mode.js             # 개발 목 여부와 최소 세션 판단
└── api/
    ├── http-client.js             # baseURL, 인증 헤더, adapter 선택
    ├── modules/
    │   ├── auth.api.js
    │   ├── users.api.js
    │   ├── dreams.api.js
    │   ├── generation.api.js
    │   ├── square.api.js
    │   ├── comments.api.js
    │   ├── statistics.api.js
    │   └── rooms.api.js
    └── mocks/
        ├── mock-adapter.js        # 목 응답·오류와 메모리 저장소
        ├── assets/dream-sample.jpg
        └── README.md
```

호출 흐름은 `page/feature → 업무별 API 모듈 → 공용 Axios → 실제 HTTP 또는 목 adapter`다. API 모듈은 Recoil·router·UI와 Query를 참조하지 않는다. 목은 상위 page/feature/entity의 fixture를 import하지 않고 자체 자산을 사용한다.

기존 홈 전용 fixture 파일은 남아 있지만 HomePage에서 더 이상 사용하지 않는다. 홈의 실패 시 dummy 대체도 제거했다. 기존 URL atom은 OAuth·Socket.IO의 실제 모드 사용처가 남아 있으므로 유지한다.

## 4. 모드·인증·외부 연동

### 설정

| 설정 | 실제 동작 |
| --- | --- |
| `VITE_API_MOCK` 생략 또는 `'false'` 이외 값 | `import.meta.env.DEV`일 때 목 사용 |
| `VITE_API_MOCK=false` | 실제 HTTP와 기존 인증 흐름 사용 |
| `VITE_API_BASE_URL` | 실제 요청 baseURL, 없으면 기존 `VITE_BASE_URL` 사용 |
| 두 baseURL 모두 없음 | Axios의 상대 경로 요청. localhost:8080 자동 기본값 없음 |

문자열 `'false'`를 정확히 사용하고 설정 변경 후 개발 서버를 재시작한다. 일반 프로덕션 빌드에서는 DEV가 false이므로 목이 비활성화된다. `NODE_ENV=development`로 강제한 비표준 build를 거부하는 장치는 아직 없으며 해당 조합을 검증했다고 보지 않는다.

### 데모 접근과 실패

- 보호 화면의 토큰 검사는 공통 `hasApiSession()`을 사용한다. 목이면 데모 접근을 허용하고 실제 모드이면 기존 토큰 유무를 확인한다.
- `/users/info`는 고정 ADMIN 프로필을 반환한다. 사용자 전역 초기화 Provider는 없으며 기존 페이지 조회로 Recoil을 채운다.
- 로그인 버튼은 목 모드에서 홈으로 이동한다. 인증 콜백의 더미 헤더 값은 실제 localStorage에 저장하지 않는다.
- 목 요청에는 기존 실제 토큰을 자동 첨부하지 않는다. 실제 토큰을 목 토큰으로 교체하지 않는다.
- 로그아웃 후에도 목 모드의 데모 접근은 계속 가능하다. 이를 실제 로그인·로그아웃 검증으로 보지 않는다.
- 실제 요청 실패는 원래 오류로 전달한다. 목으로 바꿔 성공 처리하거나 쓰기 요청을 자동 재실행하지 않는다.
- 미구현 목 경로는 501로 실패하며 실제 서버에 전달하지 않는다. 취소된 목 요청은 지연 종료 후 canceled로 처리한다.

### 외부 연동

| 대상 | 목 모드 |
| --- | --- |
| OAuth | 외부 제공자 이동 대신 데모 홈 진입 |
| Firebase·푸시 | 앱 SDK 초기화·토큰·권한 요청 생략, 설정 토글은 화면 상태만 변경 |
| 개발 PWA | Firebase 서비스 워커 신규 등록 생략. 이전에 등록된 워커의 자동 제거는 미구현 |
| Socket.IO | 실제 연결 생략, 기본 메시지와 현재 방 화면의 로컬 채팅 입력만 제공 |
| YouTube | 실제 외부 플레이어 사용. 재생·다중 사용자 동기화는 목 검증 범위 밖 |
| 음성 인식 | 기존 브라우저 기능 유지. 지원 여부·권한은 별도 검증 |

## 5. API 적용 범위

A01~A22는 현재 프론트 호출에 대응한다. 경로는 controller 기준이며 배포 prefix를 포함하지 않는다. 모든 응답은 AxiosResponse로 반환되며 아래 내용은 body·상태·저장소 동작을 설명한다.

| ID | 모듈·메서드 | HTTP / 경로 | mock 응답 및 상태 변화 |
| --- | --- | --- | --- |
| A01 | authApi.refreshSession | POST `/auth/refresh` | 200, 더미 Authorization 헤더. 콜백은 실제 저장소에 저장하지 않음 |
| A02 | usersApi.getUserInfo | GET `/users/info` | 고정 ADMIN 사용자의 userId/email/nickname/role |
| A03 | usersApi.logout | POST `/users/logout` | 성공 응답. 설정 화면은 사용자 상태를 비우고 로그인으로 이동하지만 데모 접근은 유지 |
| A04 | usersApi.updateNickname | PATCH `/users/nickname` | 해당 사용자의 nickname 갱신. 재조회와 댓글 표시에도 반영 |
| A05 | dreamsApi.getMonthlyDreams | GET `/dream/{userId}/{writeTime}` | 사용자·월로 필터한 날짜 내림차순 목록, 사용자 전체 totalCount. 날짜 유효성 검증은 미구현 |
| A06 | dreamsApi.createDream | POST `/dream/create` | 새 ID를 내부 할당해 저장. 응답은 실제 API처럼 성공·빈 data |
| A07 | dreamsApi.getDream | GET `/dream/{dreamId}` | 동일 store의 content/image/interpretation/summary/공유 여부/userId/writeTime. 없는 ID는 404 |
| A08 | dreamsApi.updateDream | PUT `/dream/{dreamId}` | 갱신. 홈·상세·광장 재조회에 반영 |
| A09 | dreamsApi.deleteDream | DELETE `/dream/{dreamId}` | 삭제. 연관 댓글 정리·광장 제외 |
| A10 | dreamsApi.saveDraft | POST `/dream/temporary` | 일반 생성과 같은 방식으로 저장. 목록·총건수·통계에 포함되는 현재 제한 있음 |
| A11 | generationApi.generateImages | POST `/api/generate-image` | 로컬 샘플 이미지 1개. 검열·실패 시나리오는 미구현 |
| A12 | generationApi.generateInterpretation | POST `/api/generate-interpretation` | 고정된 한국어 해몽 예시 문자열. 입력별 분석·오류 시나리오는 미구현 |
| A13 | squareApi.getDreams | GET `/square/dreams` | 같은 꿈 store의 공개 데이터만 cursorId/size 기준으로 반환 |
| A14 | squareApi.getDream | GET `/square/{dreamId}` + userId query | summary/content/image/comments, 현재 사용자 기준 소유·좋아요 여부 |
| A15 | commentsApi.createComment | POST `/comments/create` | 꿈 존재와 댓글 공백 검사 후 고정 사용자로 추가. 성공·빈 data |
| A16 | commentsApi.toggleLike | POST `/comments/{userId}/{commentId}/like` | 단일 데모 사용자 기준 좋아요 토글. status like/unLike, 재조회 count와 일치 |
| A17 | commentsApi.deleteComment | DELETE `/comments/{commentId}` | 삭제. 없는 ID는 404. 지정 오류 시나리오는 미구현 |
| A18 | statisticsApi.getMonthlyStatistics | GET `/statistics/{userId}/{currentDate}` | 선택 월의 objects/characters/locations/moods/dreamTypeCounts. 데이터 없는 월은 빈 배열 |
| A19 | roomsApi.getRooms | GET `/rooms` | 동일 방 store의 목록. 빈 목록도 200과 빈 배열 |
| A20 | roomsApi.getRoom | GET `/rooms/{roomId}` | roomId/title/youtubeLink/thumbnail/participantCount, 없는 ID는 404 |
| A21 | roomsApi.createRoom | POST `/rooms` | 방 생성. 실제처럼 201·성공 응답 |
| A22 | roomsApi.deleteRoom | DELETE `/rooms/{roomId}` | 삭제. 목록·상세에 반영 |


백엔드에만 있는 파일 업로드·다운로드·삭제, 알림 예약, FCM 토큰 등록은 현재 프론트 호출 범위에 없어 목을 추가하지 않았다. 사용처를 추가할 때 API 모듈과 목도 함께 정의한다.

## 6. 데이터 정책과 서버와의 차이

- 초기 데이터는 현재 월 꿈 15개와 공유 꿈 10개, 댓글 1개, 방 1개다. 기본 size=10에서는 광장 목록 한 페이지와 다음 빈 페이지가 나온다. 추가 페이지 검증은 작은 size로 수행했다.
- 사용자·월 필터와 날짜 내림차순을 적용하며 totalCount는 해당 사용자의 전체 꿈 수다.
- 공유 상태·삭제·댓글·좋아요·닉네임·방 변경은 같은 저장소에 반영한다. ID는 자원별 증가 시퀀스를 사용하며 반환 데이터는 복사한다.
- 저장소는 브라우저 앱 실행 내 메모리다. 탭 간 공유·새로고침 후 영속화·명시적 reset 도구는 없다. 개발 HMR에서도 모듈 재평가 시 초기화될 수 있다.
- 생성·수정 요청은 기존 화면의 `isShared`를 읽고 상세 응답에는 `shared`를 제공한다. 실제 서버의 요청 boolean 직렬화와 일치하는지는 연결 시 확인한다.
- 임시 저장은 현재 일반 생성과 같은 처리로 요약·유형을 만들고 통계에도 포함한다. 서버의 임시 저장 카테고리 제외 동작과 다르다.
- 통계 유형 건수는 선택 월 저장소에서 계산하지만 키워드·해시태그는 고정 예시다. 수정 시 AI 재분석도 하지 않는다.
- 없는 꿈·댓글·방은 목에서 404다. 서버의 없는 댓글·광장 꿈에 대한 일부 400 응답과 다르다.
- 오류 body의 `error.code/message`는 개발용이다. 현재 백엔드의 모든 오류 계약이 이 형태로 변경된 것은 아니다.
- 목 응답에는 내부 데이터의 추가 필드가 포함될 수 있으며 엄격한 DTO 검증을 구현하지 않았다. 실제 서버 계약 일치를 완료했다고 보지 않는다.
- 역할·소유권·공개 여부의 보안 시나리오, 실제 로그인·AI·푸시·다중 사용자 채팅은 이 목으로 검증하지 않는다.

## 7. 검증 상태

| 항목 | 상태·범위 |
| --- | --- |
| 목 API 동작 | 공통 Axios를 통한 꿈 CRUD·임시 저장·광장 cursor·댓글·좋아요·닉네임 재조회·통계·방 CRUD·생성 예시 검증 통과 |
| 실패·격리 | 없는 ID 404·미구현 경로 501·요청 취소·기존 실제 토큰 자동 미첨부 검증 통과 |
| 빌드 | 일반 프로덕션/PWA 빌드 통과. 산출물에 목 handler 식별 문자열이 없음을 확인 |
| lint | 신규 api-mode/http-client/mock-adapter 검사 통과. 전체 기존 lint 해소는 범위 밖 |
| 화면 통합 | 브라우저에서 페이지별 클릭·폼 저장·직접 URL 진입 검증은 미수행 |
| 실제 서버·외부 서비스 | 운영 prefix·응답 직렬화·인증·DB·OAuth·푸시·실시간 연동 미검증 |
| 시나리오 도구 | 401/403/5xx·네트워크·timeout·검열·다중 프로필 전환 미구현 |

API 검증은 일회성 실행으로 수행했으며 저장소의 자동 회귀 테스트 스위트로 추가하지 않았다. 전체 계획 완료와 현재 개발에 필요한 목 연결 완료를 구분한다.

## 8. 후속 순서

1. 현재 방식으로 화면 개발을 진행하며 브라우저 주요 흐름을 검증한다. 조회·수정·빈 상태·실패 상태를 함께 확인한다.
2. 서버 연결 전 boolean 요청 키, 응답 필드·HTTP 상태, 임시 저장·통계 정책을 실제 서버와 대조한다. 개발용 차이를 제거하거나 명시적으로 유지한다.
3. 필요한 오류·빈 데이터·역할별 시나리오와 회귀 테스트를 보강한다. 자동 fallback은 선행 조건으로 두지 않는다.
4. 백엔드 공통 오류 계약이 확정되면 API 구현 계약과 목 오류를 함께 갱신한다.
5. [TanStack Query 후속 계획](./frontend-query-cache-plan.md)에 따라 한 기능씩 서버 상태 관리를 이관한다. 이번에는 라이브러리를 설치하거나 캐시를 추가하지 않았다.

초기 계획의 세션 Provider·복수 프로필·실시간 모드 전환·generation·개발 상태 UI·handler 세분화는 필요할 때 별도 범위를 정한다. 커밋·브랜치 생성은 이 문서 갱신에 포함하지 않는다.

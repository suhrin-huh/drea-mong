# Frontend API 중앙 관리 및 API별 Mock 설계 계획

작성일: 2026-10-22. 현재 frontend와 대응하는 backend 컨트롤러·DTO를 조사한 구현 전 계획이다. 이 문서 작성 단계에서는 API 코드나 페이지 동작을 변경하지 않는다.

## 1. 목표와 기본 방향

- URL, HTTP method, 인증 헤더, 요청 파라미터, 응답 변환을 페이지·컴포넌트에서 제거하고 `shared/api`에서 중앙 관리한다.
- API를 하나의 큰 파일에 넣지 않고 업무 영역별 모듈로 나눈다. 페이지는 `dreamsApi.getMonthlyDreams(...)`처럼 공개 메서드만 호출한다.
- 개발 환경에서는 실제 서버를 우선 사용하되, 정해진 오류가 발생하면 mock 세션으로 전환해 페이지 개발을 계속할 수 있게 한다.
- 모든 대상 API에 대응하는 mock handler를 제공한다. 조회뿐 아니라 작성·수정·삭제·좋아요 후 다시 조회하는 흐름도 작동하도록 한다.
- 실제 데이터와 mock 데이터가 섞이지 않도록 세션과 데이터 출처를 관리한다. mock 토큰을 실제 서버에 보내지 않는다.
- 프로덕션에서는 mock을 실행하지 않고 정상적인 오류 처리·인증 흐름을 유지한다.

기존 React/Recoil/Axios를 유지한다. 이번 계획의 기본 구현은 Axios 앞의 공통 요청 계층과 개발용 mock transport이며, 별도 요청 캐시 라이브러리나 네트워크 가로채기 라이브러리 도입은 전제하지 않는다.

## 2. 현재 상태와 선행 정리

| 현재 상태 | 필요한 정리 |
| --- | --- |
| Axios 직접 호출이 page·dream-editor·알림 모듈에 분산 | 업무별 API 모듈로 이동 |
| 공용 client와 개별 Axios 호출이 혼재 | 공통 transport로 통일 |
| `import.meta.VITE_BASE_URL`과 URL Recoil atom이 혼재 | `import.meta.env` 기반 설정으로 통일 |
| 홈 요청에 `api/` 접두사가 추가되고 다른 요청은 baseURL에 의존 | 실제 배포 prefix와 컨트롤러 경로를 구분해 최종 URL 검증 |
| HomePage의 catch가 모든 오류를 dummy로 대체 | 요청 실패만 중앙 정책으로 처리. UI의 TypeError·미정의 변수는 숨기지 않음 |
| 페이지가 요청 전에 token을 검사하고 로그인 이동 | 앱 초기화·세션 판단을 공통화하여 개발 데모 세션 허용 |
| `response.data.data`, header token, status 검사, 204가 혼재 | endpoint별 응답 계약을 명시 |
| 저장 요청의 미await·임의 지연 후 이동 코드 존재 | 성공 완료를 await하고 상태 전환·이동 처리 |
| 빈 Firebase 설정과 직접 Google 토픽 요청 존재 | 백엔드 API와 외부 연동을 별도 경계로 관리 |

`/users/info` 등 컨트롤러 경로와 외부 URL의 `/api` prefix는 같은 개념이 아니다. 현재 프론트의 생성 API는 baseURL에 `/api/generate-*`를 추가한다. 구현 전 실제 프록시·서버 context를 확인하고 요청 URL 테스트로 확정한다. 모든 경로에서 `/api`를 기계적으로 제거하거나 중복 추가하지 않는다.

기존 `etDreams`, `err`, `Navigate`, `isScrolledToBottom` 미정의 참조와 Promise 접근 순서 문제는 API 전환을 검증할 수 있도록 해당 화면을 이관할 때 별도 수정한다. 동작을 방해하는 기존 버그를 mock 성공으로 감추지 않는다.

## 3. 권장 폴더 구조와 FSD 의존 관계

```text
src/
├── app/
│   ├── providers/
│   │   └── SessionProvider.jsx       # 사용자 초기화·세션 상태 연결
│   └── ui/
│       └── DevApiStatus.jsx          # 개발 환경에서 현재 데이터 출처 표시
├── entities/
│   └── user/model/                  # 사용자·세션을 소비하는 상태
└── shared/
    ├── config/
    │   └── api-config.js            # URL, mode, timeout, 개발 세션 설정
    └── api/
        ├── http-client.js           # 앱 백엔드 전용 Axios transport
        ├── request.js               # 요청 실행·오류 분류·mock 전환
        ├── api-error.js             # 일관된 오류 정보
        ├── api-runtime.js           # 출처·세대·개발 세션 전환 알림
        ├── modules/
        │   ├── auth.api.js
        │   ├── users.api.js
        │   ├── dreams.api.js
        │   ├── generation.api.js
        │   ├── square.api.js
        │   ├── comments.api.js
        │   ├── statistics.api.js
        │   └── rooms.api.js
        ├── external/
        │   └── notifications.api.js # 외부 알림 HTTP 연동, 앱 token과 분리
        └── mocks/
            ├── mock-transport.js
            ├── mock-store.js
            ├── mock-config.js
            ├── mock-session.js
            ├── fixtures/
            │   ├── users.fixture.js
            │   ├── dreams.fixture.js
            │   ├── comments.fixture.js
            │   ├── rooms.fixture.js
            │   └── assets/
            ├── factories/
            │   └── create-mock-dataset.js
            └── handlers/
                ├── auth.handlers.js
                ├── users.handlers.js
                ├── dreams.handlers.js
                ├── generation.handlers.js
                ├── square.handlers.js
                ├── comments.handlers.js
                ├── statistics.handlers.js
                ├── rooms.handlers.js
                └── notifications.handlers.js
```

실제 파일이 필요한 시점에만 추가한다. 빈 폴더를 미리 만들지 않는다.

FSD 적용 기준:

- `shared/api`는 특정 백엔드의 통신 계약을 제공하는 모듈이다. entity/feature/page를 import하지 않는다.
- entity·feature·page는 필요한 API 모듈을 직접 소비할 수 있다. UI 전용 데이터 가공·상태 갱신·라우팅은 상위 계층에서 수행한다.
- mock도 HTTP 계약을 모방하는 하위 구현이다. `entities/dream`의 상수나 `pages/home`의 fixture를 역참조하지 않는다.
- 홈의 기존 mock 데이터는 공용 개발 dataset으로 이동하고, 종전 페이지의 개별 fallback을 제거한다.
- 사용자에게 제공하는 행위는 여전히 feature가 소유한다. 예를 들어 꿈 공유 조건 확인과 저장 후 이동은 API 모듈이 담당하지 않는다.
- 공용 API 전체를 묶는 거대한 `index.js`는 만들지 않는다. `@/shared/api/modules/dreams.api`처럼 모듈 단위로 import한다.

## 4. 책임 분리와 호출 흐름

| 위치 | 책임 | 포함하지 않을 내용 |
| --- | --- | --- |
| api-config | URL·모드·timeout 설정 검증 | Recoil 상태·페이지 이동 |
| http-client | 전송·인증 헤더·cookie·timeout·AbortSignal | mock dataset 선택·모달·라우팅 |
| request | endpoint ID별 요청 실행, fallback 판정, 출처·전환 관리 | 페이지 상태 변경·무조건적인 오류 무시 |
| 업무별 api 모듈 | method/path/query/body, wire 응답 해석, 공개 반환값 | UI·entity import·직접 스토리지 조작 |
| mock transport/handlers | 같은 HTTP 계약의 mock 응답·오류 | 임의의 성공 응답·상위 계층 의존 |
| SessionProvider | 초기 사용자 조회, 실제/데모 세션 구분, 상태 연결 | HTTP 경로별 세부 규칙 |
| page/feature | loading·입력·검증·최종 오류 UI·완료 후 이동 | Axios 설정·URL 문자열·mock 분기 |

```text
page / feature
    → 업무별 API 메서드
        → request(endpoint ID, method/path/params/data)
            → live: http-client
            → mock: 개발용 mock transport → handler → mock-store
        → 업무별 응답 변환
    ← 데이터 또는 정규화된 오류
```

fallback의 catch 범위는 전송 결과에 한정한다. UI 코드, 응답 변환 코드, 계약 검증 코드의 오류까지 같은 catch로 감싸지 않는다. 취소된 요청은 mock 전환을 유발하지 않는다.

호출 예시와 반환 계약:

```js
import { dreamsApi } from '@/shared/api/modules/dreams.api';

const { dreams, totalCount } = await dreamsApi.getMonthlyDreams({
  userId,
  year,
  month,
  signal,
});
```

응답 원본의 `dreamMainResponsesList`를 공개 메서드의 `dreams`로 변환할 수 있지만, 동일 메서드는 live/mock에서 같은 반환 형태를 보장해야 한다. JavaScript를 유지하고 JSDoc으로 인자·반환값·nullable 항목을 문서화한다.

## 5. 중앙 client와 응답 계약

### 5.1 설정

제안하는 환경변수:

| 설정 | 의미 | 기본 제안 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드의 외부 API base URL | 실제 prefix 확인 후 `.env.example`에 예시 제공 |
| `VITE_SOCKET_URL` | 실제 소켓 주소 | 기존 주소를 별도 설정으로 이동 |
| `VITE_API_MODE` | live / fallback / mock | 개발 fallback, 프로덕션 live 강제 |
| `VITE_ENABLE_DEMO_SESSION` | 개발 환경의 데모 인증 허용 | 개발 예시에서 true, 프로덕션 무시 |
| `VITE_API_TIMEOUT_MS` | 실제 요청 최대 대기 시간 | 초기 제안 5,000ms, 화면 요구에 따라 조정 |

`import.meta.env.DEV`와 개발용 설정을 모두 만족할 때만 mock/데모를 활성화한다. 프로덕션 빌드에 `VITE_API_MODE=mock`을 넘겨도 live로 동작해야 한다. mock 모듈은 DEV 분기 내부에서만 dynamic import하고, 빌드 산출물에 mock dataset·개발 이미지를 포함하지 않는지 검사한다.

`server.atoms.js`의 URL atom은 호출부 이관이 끝난 후 제거한다. 환경 설정은 UI 상태로 관리하지 않는다. 배포 시 환경변수가 빌드 시점에 반영된다는 점도 README에 명시한다.

### 5.2 인증과 오류

- 앱 백엔드 client에서만 실제 accessToken을 주입한다. Google 등 외부 호스트에 앱 token을 붙이지 않는다.
- `withCredentials`는 Axios 설정 위치에서 관리한다. 현재 headers 안에 들어간 잘못된 설정은 이관 시 바로잡는다.
- client는 직접 로그인 페이지로 이동하지 않는다. 오류를 반환하고 상위 세션 계층이 처리한다.
- `ApiError`는 최소한 `kind`, `httpStatus`, `endpointId`, `message`, `cause`를 유지한다. token·cookie를 로그에 출력하지 않는다.
- 오류 유형은 network, timeout, unauthorized, forbidden, not-found, validation, server, application, contract, canceled 등으로 구분한다.
- 전역 무한 refresh나 모든 요청 자동 재시도는 도입하지 않는다. refresh 자체의 실패와 인증 초기화 흐름부터 명확히 한다.

### 5.3 특수 응답

- 대부분의 컨트롤러는 `{ status, data }` 형태다. `data`만 일괄 추출하면 오류 status나 좋아요 결과를 잃으므로 endpoint별 성공 상태를 검사한다.
- HTTP 200이어도 `status: 'error'`면 성공 처리하지 않는다.
- 빈 방 목록의 204는 정상적인 `[]`로 변환하며 mock으로 대체하지 않는다.
- 인증 refresh는 body가 아니라 Authorization header에서 token을 읽는다. 공개 반환값은 실제 세션과 데모 세션을 구분하는 union으로 정한다.
- create/update/delete처럼 응답 data가 없는 명령은 `Promise<void>`를 기본으로 한다. 실제 응답에 없는 ID를 mock 반환값에만 추가하지 않는다.
- 댓글 좋아요의 `like`/`unLike`는 `{ liked: boolean }`으로 정규화하고 사용 화면도 같이 바꾼다.
- `isShared`/`shared`처럼 Java DTO와 frontend 사용명이 다른 항목은 실제 직렬화 응답을 확인하고 모듈 경계에서 하나의 공개 필드로 맞춘다.

## 6. 개발 모드와 fallback 정책

| 모드 | 실제 요청 | mock 동작 | 용도 |
| --- | --- | --- | --- |
| live | 수행 | 사용 안 함 | 서버 통합·오류 확인 |
| fallback | 실제 세션으로 시작 | 허용된 실패 시 mock 세션으로 전환 | 서버 불안정 중 개발 |
| mock | 수행하지 않음 | 시작부터 mock 세션 | UI·상호작용의 재현 가능한 개발 |

프로덕션에서는 모드 설정과 무관하게 live만 허용한다.

### 6.1 자동 전환 허용 범위

| 상황 | 제안 정책 |
| --- | --- |
| 조회 요청의 네트워크 오류·timeout·5xx | 개발 fallback에서 자동 mock 전환 |
| 인증 초기화의 401/403 또는 token 없음 | DEV + 데모 세션 허용일 때만 데모 사용자로 전환 |
| 정상 응답의 빈 배열·204 | 그대로 정상 처리 |
| 400/422 등 입력 오류 | 오류 표시. 성공 mock으로 덮지 않음 |
| 404 | 기본적으로 오류 표시. 존재하지 않는 상세 데이터는 생성해 주지 않음 |
| 권한이 필요한 조작의 403 | 권한 오류 유지. 일반 사용자를 자동 ADMIN으로 바꾸지 않음 |
| HTTP 200의 application error | 기본적으로 오류 유지. 시나리오에서 명시적으로 조정 가능 |
| 응답 계약 오류·파싱 실패·페이지 예외 | 오류 유지. 개발 오류를 mock으로 숨기지 않음 |
| 요청 취소·이전 화면의 응답 | mock 전환 없이 폐기 |
| handler가 없는 endpoint | 오류로 드러냄. 무조건 성공 응답 금지 |

이 범위는 초기 권장안이다. 사용자가 요청한 개발용 자동 대체를 제공하되, 모든 예외를 정상 데이터처럼 처리하는 방식은 피한다.

### 6.2 쓰기 요청 실패 시 주의

실제 저장 요청이 timeout되면 서버에서 저장됐는지 알 수 없다. 그 요청을 mock에 자동 재실행해 성공으로 표시하지 않는다.

- mock 세션에서 시작한 쓰기는 mock-store에 정상 반영한다.
- 실제 세션의 쓰기 실패는 성공 처리하지 않고 원래 오류를 반환한다. 자동 재시도하지 않는다.
- 개발자가 mock 세션으로 전환한 뒤 필요한 작업을 다시 시작할 수 있게 한다. 기존 실제 데이터와의 차이는 표시한다.
- 추후 쓰기까지 자동 전환하려면 요청 중복·멱등성·전환 시 입력 보존을 별도로 합의한다.
- 로그아웃은 서버 오류와 무관한 로컬 세션 정리 정책을 auth 계층에서 명시한다.

### 6.3 일관된 mock 세션

한 API씩 임의로 mock 응답을 섞으면 실제 userId로 mock 꿈을 조회하는 문제가 생긴다. 첫 전환 후에는 관련 백엔드 요청을 하나의 mock 세션으로 고정한다.

- API runtime에 `source: live | mock`과 세션 generation을 둔다.
- mock 전환 시 실제 요청들을 취소하거나 이전 generation 결과를 무시한다.
- 앱은 전환 이벤트를 받아 사용자 상태를 데모 사용자로 갱신하고, 페이지의 기존 데이터를 재초기화한다. 페이지 재마운트 등의 방식으로 기존 로컬 상태도 제거한다.
- 이미 진행 중인 실제 쓰기 결과는 mock 상태에 적용하지 않는다. 전송 취소가 서버 처리 취소를 뜻하지 않는다는 점을 구분한다.
- mock에서 실제 API로 자동 복귀하지 않는다. 개발용 전환 UI에서 선택하거나 새로고침한다.
- 개발 상태 표시에서 현재 출처·전환 이유·초기화를 확인할 수 있게 한다. 원래 오류는 개발 로그에 남긴다.

## 7. 사용자 초기화와 로그인 경로

현재 각 페이지의 `if (!accessToken) navigate('/login')`은 공통 세션 판단으로 교체한다. 이 작업 없이 요청 fallback만 추가하면 mock 페이지에 도달하지 못한다.

1. 앱 시작 시 사용자 세션을 한 번 초기화한다. 초기화 전에는 보호된 페이지의 사용자 의존 요청을 보류한다.
2. live에서는 실제 token/refresh와 사용자 정보를 확인하고 실패 시 실제 로그인 흐름으로 이동한다.
3. mock에서는 개발 사용자로 시작한다. 실제 token을 생성·저장하거나 요청하지 않는다.
4. fallback에서는 실제 인증 초기화를 먼저 수행한다. 인증 실패 시 데모 허용 설정에 따라 명시적인 데모 세션으로 전환한다.
5. `authApi.refreshSession()`의 공개 결과는 실제 token이 있는 authenticated 결과와 token이 null인 demo 결과를 구분한다. mock body에 가짜 Bearer token을 만들어 넣지 않는다.
6. 실제 token을 데모 상태로 덮어쓰지 않는다. 데모 데이터는 mock transport만 사용하고, 실제 세션 복귀는 재초기화한다.
7. OAuth 제공자 페이지로 이동하는 동작은 HTTP client의 일반 fallback 대상이 아니다. 개발 데모 진입과 실제 OAuth 로그인을 구별한다.
8. 일반 사용자와 ADMIN 개발 프로필을 별도로 선택할 수 있게 한다. 기본 데모 프로필은 일반 사용자로 둔다.
9. 보호된 페이지와 SettingsPage는 token 문자열 유무 대신 공통 세션 상태를 소비한다.

## 8. 현재 사용 중인 API 22개와 mock 생성 계획

경로는 컨트롤러 기준이며 배포 prefix를 포함하지 않는다. 생성 API의 `/api`는 해당 컨트롤러의 실제 mapping이다. 최종 외부 URL은 5절의 설정 검증에서 확정한다.

| ID | 모듈·메서드 제안 | HTTP / 경로 | mock 응답 및 상태 변화 |
| --- | --- | --- | --- |
| A01 | authApi.refreshSession | POST `/auth/refresh` | 실제 token 없는 demo 결과. 인증 실패 시나리오 별도 제공 |
| A02 | usersApi.getCurrentUser | GET `/users/info` | 선택한 데모 프로필의 userId/email/nickname/role |
| A03 | usersApi.logout | POST `/users/logout` | mock 세션 종료, 상위 계층에서 사용자 상태 초기화 |
| A04 | usersApi.updateNickname | PATCH `/users/nickname` | 해당 사용자의 nickname 갱신. 재조회와 댓글 표시에도 반영 |
| A05 | dreamsApi.getMonthlyDreams | GET `/dream/{userId}/{writeTime}` | 사용자·월로 필터한 목록과 totalCount. writeTime 형식 검증 |
| A06 | dreamsApi.createDream | POST `/dream/create` | 새 ID를 내부 할당해 저장. 응답은 실제 API처럼 성공·빈 data |
| A07 | dreamsApi.getDream | GET `/dream/{dreamId}` | 동일 store의 content/image/interpretation/summary/공유 여부/userId/writeTime. 없는 ID는 404 |
| A08 | dreamsApi.updateDream | PUT `/dream/{dreamId}` | 작성자 권한 검사 후 갱신. 홈·상세·광장 재조회에 반영 |
| A09 | dreamsApi.deleteDream | DELETE `/dream/{dreamId}` | 작성자 권한 검사 후 삭제. 연관 댓글 정리·광장 제외 |
| A10 | dreamsApi.saveDraft | POST `/dream/temporary` | 하위 필드가 비어 있을 수 있는 임시 꿈 저장. 통계 제외 규칙 적용 |
| A11 | generationApi.generateImages | POST `/api/generate-image` | 로컬 샘플 이미지 4개, 검열로 빈 항목이 있는 경우·전체 실패 시나리오 |
| A12 | generationApi.generateInterpretation | POST `/api/generate-interpretation` | 입력에 대응하는 고정 seed의 한국어 해몽 문자열. 짧은 입력 오류 시나리오 |
| A13 | squareApi.getDreams | GET `/square/dreams` | 같은 꿈 store의 공개 데이터만 cursorId/size 기준으로 반환 |
| A14 | squareApi.getDream | GET `/square/{dreamId}` + userId query | summary/content/image/comments, 현재 사용자 기준 소유·좋아요 여부 |
| A15 | commentsApi.createComment | POST `/comments/create` | dreamId/userId 관계 검사 후 댓글 추가. 성공·빈 data |
| A16 | commentsApi.toggleLike | POST `/comments/{userId}/{commentId}/like` | 사용자별 좋아요 토글. wire status like/unLike, 재조회 count와 일치 |
| A17 | commentsApi.deleteComment | DELETE `/comments/{commentId}` | 작성자 권한 검사 후 삭제. 없는 ID·타인 댓글 오류 제공 |
| A18 | statisticsApi.getMonthlyStatistics | GET `/statistics/{userId}/{currentDate}` | 선택 월의 objects/characters/locations/moods/dreamTypeCounts. 데이터 없는 월은 빈 배열 |
| A19 | roomsApi.getRooms | GET `/rooms` | 동일 방 store의 목록. 빈 목록은 204 시나리오 지원 |
| A20 | roomsApi.getRoom | GET `/rooms/{roomId}` | roomId/title/youtubeLink/thumbnail/participantCount, 없는 ID는 404 |
| A21 | roomsApi.createRoom | POST `/rooms` | ADMIN 권한 검사 후 방 생성. 실제처럼 201·성공 응답 |
| A22 | roomsApi.deleteRoom | DELETE `/rooms/{roomId}` | ADMIN 권한 검사 후 삭제. 목록·상세에 반영 |

추가 범위의 구분:

| 현재 연동 | 중앙화·mock 방침 |
| --- | --- |
| OAuth google/naver/kakao 리다이렉트 | auth 모듈에서 URL 생성. 제공자 통신을 성공 mock으로 위장하지 않음 |
| Google 토픽 subscribe/unsubscribe HTTP 2종 | external/notifications 모듈로 격리. 개발 stub에서 구독 상태만 반영하며 실제 푸시는 보내지 않음 |
| Firebase initialize/getToken/isSupported | SDK 연동은 manage-notifications에 유지. mock 세션에서는 SDK 초기화·권한 요청을 생략하고 알림 설정 stub 사용 |
| Socket.IO 방 입장·채팅·재생 동기화 | HTTP API mock과 별도. mock 세션에서는 실제 소켓 연결을 차단하며, 1차에는 정적 방 상세와 로컬 상태만 제공 |
| YouTube iframe·외부 thumbnail | 실제 외부 서비스 접근은 별도. 목록 thumbnail은 로컬 fixture로 제공하고, iframe 재생 성공을 mock 완료 조건으로 삼지 않음 |
| 브라우저 음성 인식 | API mock 범위 밖. 미지원 브라우저에서도 텍스트 입력 화면이 렌더되도록 기능 감지 보완 |

backend에만 있는 파일 업로드/다운로드·삭제, 알림 예약, 사용자 FCM token 등록 등의 API는 현재 frontend 호출이 없어 1차 inventory에서 제외한다. 사용을 추가할 때 API 모듈과 mock handler를 함께 추가한다.

## 9. mock 데이터 생성과 저장소

### 9.1 생성 원칙

- 매 요청마다 랜덤 데이터를 만들지 않는다. 고정 seed와 기준 날짜를 받는 factory가 초기 dataset을 만들고, handler는 같은 store를 조회·변경한다.
- 기본 기준 날짜는 개발 시점의 오늘이다. 테스트에서는 고정 날짜를 주입한다. 오래된 고정 월 때문에 홈·통계가 빈 화면이 되지 않게 한다.
- 일반 사용자 1명·ADMIN 1명·다른 작성자 1명, 여러 달의 꿈·공개 꿈·댓글·방을 연결한다.
- 광장 데이터는 최소 2페이지 이상 생성해 cursor 종료·중복 제거를 검증한다.
- 꿈 ID·댓글 ID·방 ID는 독립된 증가 시퀀스를 사용하고 초기 seed와 충돌하지 않게 한다.
- 반환값은 복사하여 UI에서 배열을 변경해도 원본 store가 손상되지 않게 한다. 현재 이미지 생성 UI의 배열 push도 이관 시 원본 변경을 피하도록 정리한다.
- 로컬 이미지·아이콘은 mock fixture가 소유하고 import로 경로를 관리한다. 상위 페이지 assets를 import하지 않는다.

### 9.2 데이터 관계와 변화

| 데이터 | 일관성 규칙 |
| --- | --- |
| 사용자 | nickname 변경 후 사용자 정보·작성자 표시 갱신 |
| 꿈 | 작성자 ID, 날짜, 공유 여부, 임시 저장 상태를 보존 |
| 광장 | 공개 가능한 꿈만 노출, 비공개 변경·삭제 즉시 제외 |
| 댓글 | 존재하는 공유 꿈에 연결, 작성자·좋아요 사용자 집합 보존 |
| 통계 | 임시 저장 제외, 선택 월·사용자 필터, 꿈 변경 후 재계산 |
| 방 | 생성·삭제·상세 조회가 같은 store 사용, 권한 프로필 반영 |
| 알림 stub | 개발 세션의 구독 on/off 저장. 실제 FCM 수신을 보장하지 않음 |

AI 분석 결과는 mock 데이터의 고정 키워드·유형을 이용한다. 임의 입력의 실제 해몽·통계 정확성을 흉내 내는 것은 목표가 아니다. 다만 꿈 추가·삭제·월 변경과 통계 건수는 서로 모순되지 않아야 한다.

### 9.3 재현 가능한 시나리오

- 기본 정상 데이터, 빈 목록, 댓글 없는 상세, 이미지 없는 꿈, 임시 저장 꿈.
- cursor 첫 페이지·다음 페이지·마지막 빈 페이지.
- 검열된 이미지 일부/전체, 해몽 실패.
- 401/403/404/5xx, network, timeout, HTTP 200 application error.
- 사용자/ADMIN 프로필과 타인 데이터 변경 거부.
- 선택한 endpoint만 실패시키는 개발 설정, 지연 시간, 실패 횟수.

설정은 `mock-config.js`와 개발 초기화 도구에서 관리한다. 페이지마다 flag나 fixture를 추가하지 않는다. 실패 시나리오는 mock 자체가 해당 오류를 반환하도록 하며, 다시 fallback하여 무한히 성공으로 바꾸지 않는다.

### 9.4 데이터 수명

1차 권장안은 메모리 저장이며 새로고침·개발 초기화 시 seed 상태로 돌아간다. 작성/수정/삭제가 반영되는 것은 같은 실행 세션 안에서다. 새로고침 후 유지가 필요하면 후속으로 버전이 있는 sessionStorage 저장을 추가한다. 실제 token 저장소와 구분하며, 아직 답변받지 않은 선호사항이므로 구현 전 확인 항목으로 남긴다.

## 10. 이관 대상과 순서

| 현재 호출부 | 변경 후 |
| --- | --- |
| HomePage | 사용자 초기화 결과 + dreamsApi, 기존 페이지 dummy catch 제거 |
| AuthCallbackPage / LoginPage | authApi와 공통 세션 처리, OAuth URL 생성 분리 |
| DreamCreatePage / DreamEditPage | dreamsApi, 공통 사용자, 응답 후 이동 |
| DreamEditorHeader | dreamsApi.saveDraft/deleteDream, 미await 저장 수정 |
| DreamImageGenerator / DreamInterpretationPanel | generationApi, 로컬 입력 오류와 요청 오류 구별 |
| SquarePage / SquareDetailPage | squareApi/commentsApi, 사용자 중복 요청 제거 |
| StatisticsPage | statisticsApi, 사용자·월 변경과 loading 처리 정리 |
| SettingsPage | usersApi와 알림 연동 경계, token 유무 직접 판단 제거 |
| StreamingLayout / StreamingListPage / StreamingRoomPage | usersApi/roomsApi, 실제·mock 소켓 분기 |
| push-notifications.js | 외부 HTTP를 notifications.api로 이동, SDK 책임 유지 |

구현 단계와 커밋 단위 제안:

1. `docs: API 중앙 관리와 mock 계약 확정`
   - 이 문서를 기반으로 최종 URL·DTO·fallback·세션·데이터 수명을 확정한다.
2. `refactor: 공통 API 설정과 요청 계층 통합`
   - config/client/request/error, timeout·인증·취소·원본 오류 보존, URL 테스트 추가.
3. `refactor: 업무별 API 모듈로 요청 코드 분리`
   - A01~A22 모듈과 응답 변환, 외부 알림 HTTP 경계 추가. 먼저 live로 검증.
4. `feat: API별 mock handler와 데이터 저장소 추가`
   - seed/factory/store, 22개 handler, 외부 알림 stub, CRUD·cursor·권한·통계 시나리오.
5. `feat: 개발 mock 세션과 자동 fallback 적용`
   - 모드 선택, 데모 인증, generation 전환·이전 응답 무시, 개발 출처 표시.
6. `refactor: 페이지와 기능을 중앙 API 호출로 전환`
   - 사용자 초기화 중복·페이지 token 검사·페이지 fallback 제거, 단계별 화면 검증. 크면 사용자/꿈, 광장/통계, 방/설정으로 커밋을 나눈다.
7. `test: API 계약과 mock 전환 시나리오 검증`
   - live adapter·mock의 동일 공개 계약, 실패 분류, 쓰기 timeout, 프로덕션 mock 제외 검증.
8. `docs: API 사용 규칙과 개발 mock 실행 방법 정리`
   - .env.example·README, endpoint별 샘플·초기화·제한사항 문서화.

공통 규칙은 `label: 간단한 작업 한줄 요약`이다. 기존 package.json/package-lock.json의 사용자 변경을 보존하며, 새 의존성이 꼭 필요할 때만 분리해서 추가한다.

## 11. 검증 및 완료 기준

### 계약과 단위 검증

- A01~A22 모두 메서드·최종 URL·query/body·인증 조건·성공/실패 계약·mock handler가 존재한다.
- 실제 서버를 호출하지 않는 HTTP transport stub으로 wire 응답·204·headers·application error를 검사한다. 실제 서버 통합 검증 여부는 별도로 기록한다.
- live/mock 메서드가 같은 공개 반환 계약을 충족하고, API에 없는 필드를 mock에만 요구하지 않는다.
- 조회 실패 전환, 400/404 유지, 인증 데모 허용 여부, AbortSignal 취소, 계약 오류 미은폐, mock handler 누락을 검사한다.
- 실제 쓰기 timeout이 mock 성공으로 바뀌거나 중복 재실행되지 않는다.
- source generation 전환 뒤 늦은 실제 응답이 mock 사용자·데이터를 덮지 않는다.
- CRUD 후 목록/상세·광장·댓글·좋아요·통계 관계가 일치한다. reset 후 초기 seed가 복원된다.
- 기준 날짜·seed를 고정하면 같은 dataset이 재현된다. 페이지에서 반환 배열을 바꿔도 store 원본은 유지된다.

### 화면 검증

- 서버 없는 mock 모드에서 token을 수동 조작하지 않고 홈·작성·편집·광장·통계·설정·방 목록/상세에 진입한다.
- 작성 → 홈 조회 → 편집 → 공유 → 광장 상세 → 댓글/좋아요 → 삭제까지 동작한다.
- 실제 서버 없는 fallback 초기화와 live 실패가 정해진 규칙대로 작동한다.
- 사용자/ADMIN 차이, 빈 화면·오류 화면·로딩 상태, 개발 출처 표시를 확인한다.
- mock 화면이 Firebase 권한·실제 Socket.IO 연결·외부 thumbnail 실패에 막히지 않는다. 외부 iframe의 실재생 성공은 별도 항목이다.
- 미지원 음성 인식 환경에서 입력 화면 자체가 중단되지 않는다.

### 구조와 빌드 검증

- `npm run build`와 `node scripts/check-structure.mjs`가 통과한다.
- mock dataset·개발 이미지·handler가 production chunk에 포함되거나 실행되지 않는지 확인한다.
- page/feature의 `axios` import, 백엔드 URL 문자열, 공용 백엔드 호출의 직접 fetch가 남지 않는다. Socket.IO·SDK 등 별도 경계는 구분한다.
- shared/api가 상위 FSD 계층을 import하지 않으며 API 요청 경로·자산 대소문자와 공개 export가 정상이다.
- lint는 현재 기준 오류 341건·경고 78건과 비교한다. 이번 작업이 건드린 API·세션·mock 코드의 신규 오류를 남기지 않는다. 관련 없는 전체 lint 해소는 별도 범위다.
- 기존 URL atom과 HomePage 전용 fallback을 제거하고, 실패 로그에 token·cookie가 노출되지 않는다.

## 12. 구현 전 확인할 선택사항

현재는 다음을 권장 기본안으로 기록하며, 구현 시작 전에 사용자와 확정한다.

| 항목 | 권장안 | 대안 |
| --- | --- | --- |
| mock 범위 | 조회 + 세션 내 CRUD | 우선 조회 전용으로 축소 |
| 개발 기본 모드 | fallback, live/mock 선택 가능 | 처음부터 mock 고정 |
| 데이터 수명 | 새로고침 시 초기화되는 메모리 | 버전이 있는 sessionStorage |
| 인증 실패 | DEV 데모 허용 시에만 전환 | 실제 로그인 필수 |
| 실제 쓰기 실패 | 원래 오류 유지, 자동 mock 재실행 금지 | 별도 중복 처리 설계 후 확대 |
| 소켓 | 1차 실제 연결 차단·정적/로컬 표시 | 별도 가상 소켓 adapter 구현 |
| 알림 | 설정 변경 stub | 실제 FCM 연동은 별도 개발 환경에서 검증 |

특히 실제 backend의 외부 prefix와 DTO 직렬화, 삭제 시 연관 데이터·통계 정책은 controller/service 및 실제 응답을 함께 확인해 최종 계약표에 반영한다. 문서의 mock 정책을 실제 서버 동작이 확인된 것처럼 취급하지 않는다.

## 13. 조사 근거

- [기존 폴더 구조 개편 계획](./frontend-restructure-plan.md)
- [현재 HTTP client](../frontend/src/shared/api/http-client.js)
- [현재 URL 상태](../frontend/src/shared/config/server.atoms.js)
- [HomePage](../frontend/src/pages/home/ui/HomePage.jsx)
- [AuthCallbackPage](../frontend/src/pages/auth-callback/ui/AuthCallbackPage.jsx)
- [DreamController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/dream/controller/DreamController.java)
- [SquareController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/dream/controller/SquareController.java)
- [CommentController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/comment/controller/CommentController.java)
- [RoomController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/room/controller/RoomController.java)
- [AuthController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/user/controller/AuthController.java)
- [UserController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/user/controller/UserController.java)
- [ImageController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/api/controller/ImageController.java)
- [CategoryController](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/category/controller/CategoryController.java)
- [ApiResponse](../backend/dreamong/src/main/java/com/ssafy/dreamong/domain/entity/common/ApiResponse.java)

# Frontend API 구현 계약

갱신일: 2026-10-26. 업무별 API 모듈·공용 Axios·개발 목의 현재 구현을 기준으로 정리했다. 실제 서버 응답·운영 프록시·직렬화는 미검증이며, 목의 개발 편의 동작을 서버의 보장으로 간주하지 않는다.

전체 방향과 변경 비교: [API 중앙 관리 및 Mock 적용 계획](./frontend-api-mock-plan.md). 실행 방법: [Mock API 안내](../frontend/src/shared/api/mocks/README.md).

## 1. 공개 반환 계약

- 업무별 모듈은 default export한다. 반환값은 원본 AxiosResponse이며 AxiosError도 그대로 전달한다.
- 표의 data는 `response.data.data`를 의미한다. 별도의 DTO·void·세션 union 반환값 정규화나 공통 envelope 검증을 구현하지 않았다.
- config는 마지막 선택 인자로 전달하며 `signal` 등 Axios 설정을 받는다. 날짜는 호출부에서 `writeTime/currentDate`로 가공한다.
- 페이지·feature가 응답 추출·상태 갱신·최종 오류 UI·라우팅을 담당한다. API 모듈은 권한 판정·Query·Recoil·router에 의존하지 않는다.

## 2. URL·설정

- baseURL은 `VITE_API_BASE_URL || VITE_BASE_URL`이다. 둘 다 없으면 상대 경로 요청이며 localhost:8080 기본값은 구현되어 있지 않다.
- Axios의 기본 URL 결합을 사용한다. controller의 `/api`를 자동 추가·제거하지 않는다.
- base가 `http://localhost:8080`이면 `/users/info`와 `/api/generate-image`에 요청한다. base가 `https://example.test/api`이면 각각 `/api/users/info`, `/api/api/generate-image`가 된다. 이는 결합 예시이며 운영 설정 검증 결과가 아니다.
- OAuth·Socket.IO의 실제 주소는 기존 URL atom 사용을 유지한다. OAuth URL 생성의 API 계층 분리는 아직 하지 않았다.
- 개발 목은 `import.meta.env.DEV && VITE_API_MOCK !== 'false'`일 때 사용한다. 실제 연결은 `VITE_API_MOCK=false`와 baseURL을 설정하고 개발 서버를 재시작한다.
- 별도 `VITE_API_MODE`, 인증 우회·프로필 flag, 공통 timeout, runtime 전환·generation은 없다.
- 일반 프로덕션 빌드는 목을 비활성화한다. 비표준 `NODE_ENV=development` build 거부 기능은 미구현이다.

## 3. 요청과 응답 데이터

| ID | method / controller 경로 | 입력 | 성공 HTTP / body의 data 또는 특수 처리 |
| --- | --- | --- | --- |
| A01 | POST `/auth/refresh` | body 없음, RefreshToken cookie | 200, Authorization 헤더. 목은 더미 헤더를 반환하며 콜백에서 저장 생략 |
| A02 | GET `/users/info` | 없음 | 200, `{userId,email,nickname,role}`; role은 MEMBER/ADMIN |
| A03 | POST `/users/logout` | 없음 | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A04 | PATCH `/users/nickname` | `{nickname}` | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A05 | GET `/dream/{userId}/{writeTime}` | 인자 userId/writeTime (`YYYYMMDD`, 호출부에서 가공) | 200, `{dreamMainResponsesList:[{dreamId,content,image,writeTime}],totalCount}` |
| A06 | POST `/dream/create` | DreamCreate | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A07 | GET `/dream/{dreamId}` | dreamId | 200, `{content,image,interpretation,summary,shared,userId,writeTime}` |
| A08 | PUT `/dream/{dreamId}` | dreamId, DreamUpdate | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A09 | DELETE `/dream/{dreamId}` | dreamId | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A10 | POST `/dream/temporary` | DreamCreate | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A11 | POST `/api/generate-image` | `{prompt}` | 200, 이미지 URL 배열(string[]) |
| A12 | POST `/api/generate-interpretation` | `{message}` | 200, string |
| A13 | GET `/square/dreams` | query cursorId 생략 가능, size 기본 10 | 200, `[{dreamId,userId,image}]` |
| A14 | GET `/square/{dreamId}` | dreamId, query userId | 200, `{summary,content,image,comments:Comment[]}` |
| A15 | POST `/comments/create` | `{content,dreamId,userId}` | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A16 | POST `/comments/{userId}/{commentId}/like` | userId/commentId, body 없음 | 200, body status `'like'` / `'unLike'` |
| A17 | DELETE `/comments/{commentId}` | commentId | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |
| A18 | GET `/statistics/{userId}/{currentDate}` | 인자 userId/currentDate (`YYYYMM`, 호출부에서 가공) | 200, Statistics |
| A19 | GET `/rooms` | 없음 | 200, Room[]; 서버 204는 호출부에서 처리, 목 빈 목록은 200/[] |
| A20 | GET `/rooms/{roomId}` | roomId | 200, Room |
| A21 | POST `/rooms` | `{title,youtubeLink,thumbnail}` | 201, 성공 envelope (생성 ID 반환 없음) |
| A22 | DELETE `/rooms/{roomId}` | roomId | 200, 성공 envelope; 모듈은 AxiosResponse 반환 |


필드와 소비 규칙:

- 꿈 생성·수정 화면의 현재 요청은 `{content,image,interpretation,userId,isShared,writeTime}`다. 목도 `isShared`를 읽고 상세에는 `shared`를 반환한다. 서버 DTO의 Java boolean과 실제 요청 JSON 키의 일치 여부는 서버 연결 시 검증한다.
- 꿈 상세는 `{content,image,interpretation,summary,shared,userId,writeTime}`를 소비한다. 목에는 dreamId·dreamType 등의 추가 필드가 있을 수 있다.
- 댓글은 `{id,content,likesCount,nickname,commentOwner,likedByUser}`를 소비한다. 목에는 dreamId/userId 등의 내부 추가 필드가 포함될 수 있다.
- 통계는 `{userId,moods,characters,locations,objects,dreamTypeCounts}`다. objects의 hashTags는 배열, dreamTypeCounts는 `{dreamType,count}` 배열이다.
- 방은 `{roomId,title,youtubeLink,thumbnail,participantCount}`다.
- 꿈 목록의 totalCount는 사용자 전체 꿈 수이고 임시 저장도 포함한다. 목록은 사용자·월로 필터하고 날짜 내림차순으로 반환한다.
- 광장은 공유된 꿈을 ID 내림차순으로 반환하며 cursorId보다 작은 ID를 조회한다. 종료는 빈 배열이다.
- 명령 응답의 data는 목에서 null이다. 새 ID는 내부적으로만 할당하고 생성 응답에 추가하지 않는다.

## 4. 목 데이터·세션·외부 연동 계약

- 현재 월 꿈 15개(공유 10개), 다른 작성자의 댓글 1개, 방 1개와 고정 ADMIN 사용자로 시작한다. 다중 프로필·기준 날짜 주입은 없다.
- 같은 앱 실행 안에서 CRUD와 좋아요·닉네임 변경이 재조회에 반영된다. 반환 데이터는 복사하며 ID는 자원별로 증가한다.
- 새로고침 또는 모듈 재평가 시 초기화될 수 있는 메모리 저장소다. 영속화·탭 공유·reset UI는 없다.
- `hasApiSession()`은 목 모드의 데모 접근 또는 실제 모드의 기존 토큰 유무를 확인한다. 별도 세션 Provider는 없다.
- 목 요청에 실제 토큰을 자동 첨부하지 않는다. 콜백은 더미 토큰을 localStorage에 저장하지 않는다. 로그인 버튼은 홈으로 이동한다.
- 로그아웃은 성공 응답 후 설정 화면에서 사용자 상태를 비우고 로그인 화면으로 이동한다. 목 접근을 종료하는 세션 상태는 없으며 이후 API도 계속 사용할 수 있다.
- 자동 fallback·실제 요청 재시도·실시간 모드 전환은 없다. 실제 요청 실패는 원래 오류를 전달한다.
- Firebase·푸시는 생략하고 알림 토글은 화면 상태만 변경한다. 개발 PWA 신규 등록도 목 모드에서는 생략하지만 기존 워커를 자동 제거하지 않는다.
- 소켓은 연결하지 않고 채팅 입력을 현재 화면에만 표시한다. YouTube·브라우저 음성 기능은 기존 외부·브라우저 의존성을 유지한다.

## 5. 현재 목의 오류와 서버 차이

| 항목 | 현재 목 | 실제 서버 대조·후속 작업 |
| --- | --- | --- |
| 없는 자원 | 꿈·댓글·방 404 | 서버의 없는 댓글·광장 꿈 등 일부 400과 차이 확인 |
| 잘못된 입력 | 빈 닉네임·댓글 400 | 날짜·길이·필수 필드 등의 전체 입력 검증 미구현 |
| 미구현 경로 | 501, 실제 서버로 전달하지 않음 | method까지 엄격하게 검증하는 dispatcher는 아님 |
| 요청 취소 | 120ms 지연 후 signal 검사, canceled 오류 | 지연 중 즉시 중단은 미구현 |
| 오류 body | `{status:'error',data:null,error:{code,message}}` | 기존 BE 전체 오류 형식과 동일하지 않음. BE 공통 오류 계약 확정 후 조정 |
| 임시 저장 | 일반 생성처럼 요약·유형 생성, 통계 포함 | 서버는 빈 요약·카테고리로 저장하므로 통계 정책 차이 있음 |
| 공유·소유권 | 광장 목록 공유 필터, 보안용 소유권 정책은 없음 | 실제 권한 테스트를 대체하지 않음 |
| AI 결과 | 이미지 1개, 고정 해몽·통계 키워드 | 실제 분석·검열·실패와 입력별 결과는 미구현 |
| 빈 방 목록 | HTTP 200, data=[] | 실제 서버 204 처리도 별도 검증 필요 |
| 오류 시나리오 | 존재 검사·최소 입력 검사 | 401/403/5xx·timeout·네트워크·역할 전환 설정 미구현 |

꿈 삭제는 관련 댓글을 함께 제거한다. 좋아요는 단일 데모 사용자 토글이며 다중 사용자 좋아요 집합을 구현하지 않았다. 목 통계는 저장된 월별 꿈의 유형 건수와 고정 키워드만 제공하고, 수정 시 AI 재분석을 하지 않는다.

## 6. 검증 상태와 다음 작업

공통 Axios 경유로 꿈 CRUD·임시 저장·광장 cursor·댓글·좋아요·닉네임 재조회·통계·방 CRUD·생성 예시·404/501·취소·토큰 미첨부를 일회성 검증했다. 일반 프로덕션/PWA 빌드와 신규 API 기반 파일 lint는 통과했다. 저장소의 자동 회귀 테스트 스위트로 추가한 것은 아니다.

브라우저 주요 흐름, 실제 서버·DB·운영 prefix·직렬화·인증·외부 연동은 미검증이다. 다음에는 화면 동작을 확인하고 서버 연결 전에 요청 boolean 키·HTTP 상태·임시 저장·오류 계약을 대조한다. Query 도입과 캐시는 별도 계획으로 진행한다. 이 문서 갱신은 런타임 코드나 기존 package 변경을 수정하지 않는다.

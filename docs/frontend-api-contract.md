# Frontend API 구현 계약

계획 10절의 첫 커밋 단위. 2026-10-26 저장소의 controller/DTO/service/entity를 기준으로 정리했다. 실행 중인 서버 응답과 운영 프록시는 검증하지 않았다. 아래 기본값은 이 문서의 검토 승인 후 구현 기준으로 사용한다.

## 현재 구현 범위

API 모듈 구현 기준 추가: 사용자 요청에 따라 단순 API 선언 분리를 우선하며 `shared/api/modules`의 함수는 원래 AxiosResponse와 오류를 그대로 전달한다. 아래 표의 DTO·void·특수 반환값 정규화는 이번에 구현하지 않는다. 날짜도 호출부에서 만든 writeTime/currentDate를 받는다. config는 마지막 선택 인자로 받고 signal 등을 그대로 전달한다. 모듈은 업무별 default export를 사용한다. 이전의 DTO 반환·named import 예시보다 이 기준을 우선한다.

기존 페이지 동작을 유지하며 API 선언과 통신 코드만 분리한다. 소유자·역할 검증은 백엔드 책임이며 현재 검증 유무와 무관하게 요청을 전달하고 반환 오류를 기존 오류 처리 흐름으로 넘긴다. API 모듈에 소유자 판정·요청 차단을 추가하지 않는다. 페이지의 기존 권한 UI도 이번 작업에서 재설계하지 않는다.

아래 개발 세션·mock·fallback 설계는 후속 참고 사항이다. 이번 API 분리에서는 도입하지 않으며 기존 인증·fallback 동작을 유지한다. mock에 별도 소유자 검증을 구현하는 요구도 제외한다.

## URL 규칙

- `VITE_API_BASE_URL`은 controller 경로 앞에 붙는 외부 주소다. 로컬 기본값은 `http://localhost:8080`이며 끝의 `/`를 정규화한다. endpoint의 선행 `/` 때문에 base의 경로가 유실되지 않도록 결합한다.
- 일반 API와 생성 API에 같은 base를 사용한다. controller 경로의 `/api`를 삭제하거나 자동 추가하지 않는다.
- base가 `http://localhost:8080`이면 사용자 정보는 `http://localhost:8080/users/info`, 이미지 생성은 `http://localhost:8080/api/generate-image`다.
- base가 `https://example.test/api`이면 각각 `https://example.test/api/users/info`, `https://example.test/api/api/generate-image`다. 두 번째 `/api`는 controller mapping이며 중복 제거하지 않는다. 이 예시는 URL 결합 계약이지 운영 주소 검증 결과가 아니다.
- 기존 URL atom의 `https://i11c106.p.ssafy.io/api`는 과거 설정이다. 저장소의 `frontend/nginx.conf`에는 backend proxy가 없고, compose는 호스트 `/etc/nginx`를 마운트한다. 운영 prefix와 rewrite는 배포 환경에서 별도로 확인해야 한다. 확인 전 운영 기본 주소로 하드코딩하지 않는다.
- OAuth는 같은 base에 `/oauth2/authorization/{google|naver|kakao}`를 결합한 이동 URL을 생성하며 일반 요청 fallback 대상에서 제외한다.

## 요청과 공개 반환값

모든 메서드는 선택적 `signal`을 받는다. 아래 data는 `{status:'success', data:...}`의 data를 의미한다. void 명령은 `data`가 null이거나 생략되어도 허용하되 HTTP 상태와 status를 확인한다. 표에 없는 성공 상태는 계약 오류다.

| ID | method / controller 경로 | 입력 | 성공 HTTP / 공개 반환 |
| --- | --- | --- | --- |
| A01 | POST `/auth/refresh` | body 없음, RefreshToken cookie | 200, Authorization의 Bearer token → `{kind:'authenticated', accessToken}`; mock은 `{kind:'demo', accessToken:null}` |
| A02 | GET `/users/info` | 없음 | 200, `{userId,email,nickname,role}`; role은 MEMBER/ADMIN |
| A03 | POST `/users/logout` | 없음 | 200, void |
| A04 | PATCH `/users/nickname` | `{nickname}` | 200, void |
| A05 | GET `/dream/{userId}/{writeTime}` | 공개 인자 userId/year/month → `YYYYMM01` | 200, `{dreamMainResponsesList:[{dreamId,content,image,writeTime}],totalCount}` |
| A06 | POST `/dream/create` | DreamCreate | 200, void |
| A07 | GET `/dream/{dreamId}` | dreamId | 200, `{content,image,interpretation,summary,shared,userId,writeTime}` |
| A08 | PUT `/dream/{dreamId}` | dreamId, DreamUpdate | 200, void |
| A09 | DELETE `/dream/{dreamId}` | dreamId | 200, void |
| A10 | POST `/dream/temporary` | DreamCreate | 200, void |
| A11 | POST `/api/generate-image` | `{prompt}` | 200, 이미지 URL 배열(string[]) |
| A12 | POST `/api/generate-interpretation` | `{message}` | 200, string |
| A13 | GET `/square/dreams` | query cursorId 생략 가능, size 기본 10 | 200, `[{dreamId,userId,image}]` |
| A14 | GET `/square/{dreamId}` | dreamId, query userId | 200, `{summary,content,image,comments:Comment[]}` |
| A15 | POST `/comments/create` | `{content,dreamId,userId}` | 200, void |
| A16 | POST `/comments/{userId}/{commentId}/like` | userId/commentId, body 없음 | 200, wire status `'like'` / `'unLike'`를 그대로 반환 |
| A17 | DELETE `/comments/{commentId}` | commentId | 200, void |
| A18 | GET `/statistics/{userId}/{currentDate}` | userId/year/month → `YYYYMM` | 200, Statistics |
| A19 | GET `/rooms` | 없음 | 200, Room[]; 204는 body 검사 없이 `[]` |
| A20 | GET `/rooms/{roomId}` | roomId | 200, Room |
| A21 | POST `/rooms` | `{title,youtubeLink,thumbnail}` | 201, void (생성 ID 반환 없음) |
| A22 | DELETE `/rooms/{roomId}` | roomId | 200, void |

필드 계약:

- DreamCreate: `{content,image,interpretation,userId,shared,writeTime}`. DreamUpdate: `{id?,content,image,interpretation,summary?,writeTime,shared,dreamCategories?}`. id는 DTO의 String이며 실제 대상은 path로 결정한다. summary와 category는 서버가 다시 생성하므로 생성 결과를 클라이언트에서 보장하지 않는다.
- boolean의 Java 필드명은 `isShared`, `isCommentOwner`, `isLikedByUser`지만 Lombok getter/Jackson 기본 Bean 규칙에 따른 wire 키는 `shared`, `commentOwner`, `likedByUser`로 구현한다. 현재 화면도 이 키를 소비한다. 실행 응답 직렬화 확인은 후속 검증 항목이며 상충하는 응답을 조용히 수용하지 않는다.
- Comment: `{id,content,likesCount,nickname,commentOwner,likedByUser}`. 광장 상세에는 꿈 소유자 플래그나 userId가 없다. 소유자 판정용 필드를 추가하거나 별도 조회·조합을 도입하지 않는다.
- Statistics: `{userId,moods,characters,locations,objects,dreamTypeCounts}`. 앞의 세 배열은 `{word,type}`, objects는 `{word,hashTags:string[]}`, dreamTypeCounts는 `{dreamType,count}` 배열이다. 데이터가 없는 월은 userId와 빈 배열들을 반환한다.
- Room: `{roomId,title,youtubeLink,thumbnail,participantCount}`.
- 이미지/해몽 등 선택 콘텐츠는 null/빈 문자열을 허용한다. 빈 목록은 배열이다. 필수 식별자와 envelope, 배열 구조를 검사하며 UI 표시값은 만들지 않는다.
- A05의 목록은 선택 월이며 날짜 내림차순이다. **totalCount는 사용자 전체 꿈 수이며 임시저장도 포함한다.** 월별 건수로 다시 정의하지 않는다.
- A13은 ID 내림차순, 다음 페이지는 마지막 ID를 cursorId로 전달하고 그보다 작은 ID만 반환한다. 종료는 빈 배열이며 별도 nextCursor/hasNext 필드는 없다.

## 개발 설정과 세션 (후속 범위)

- 개발 기본 mode는 fallback, timeout은 5,000ms. bypass와 demo 허용은 명시적 문자열 `'true'`일 때만 활성화하며 기본 false다.
- mock mode에서 bypass=false, demo 허용=false이면 설정 오류를 표시한다. bypass 또는 demo 허용 시 실제 token 없이 개발 프로필을 준비한다.
- mock은 조회와 세션 내 CRUD를 모두 제공한다. 메모리 store이며 새로고침/명시적 reset 시 초기화한다. sessionStorage 영속화는 이번 범위에서 제외한다. 고정 seed와 주입 가능한 기준 날짜를 사용하고 기본 날짜는 로컬 오늘이다.
- MEMBER/ADMIN/다른 작성자를 제공하며 초기 프로필은 MEMBER다. bypass는 role을 변경하지 않고 공통 접근 정책에서 적용한다.
- bypass=true이면 실제 인증 초기화를 기다리지 않고 개발 사용자로 진입한다. live에서는 실제 token이 있을 때만 백엔드 client가 이를 전송한다. 개발 사용자 ID와 실제 ID의 일치를 가정하지 않는다.
- API source는 live/mock이며 세션 kind와 구분한다. mock 전환은 전체 관련 요청을 고정하고 generation을 증가시킨다. 이전 응답은 폐기하고 상위 세션/화면 상태를 재초기화한다. 실제 token을 mock token으로 교체하지 않는다.
- 로그아웃 요청 결과와 별개로 상위 세션 계층은 로컬 token/사용자 상태를 정리하고 종료 상태를 유지한다. 자동 개발 사용자 재주입은 명시적 재진입 때만 수행한다.
- production은 live/정상 인증을 강제한다. mock은 DEV 내부 dynamic import만 허용하고 NODE_ENV=development인 build는 거부한다.

## fallback과 오류 (후속 범위)

| 조건 | 동작 |
| --- | --- |
| live mode | 전환 없이 오류 반환 |
| fallback의 GET 조회 network/timeout/5xx | mock 세션 전환; 사용자 상태 재초기화 후 새 사용자 인자로 재조회 |
| fallback의 GET 조회 401/403 | bypass=true일 때 전환; 우회가 꺼지면 demo 허용 시 401만 전환, 권한 403은 유지 |
| 인증 초기화 A01의 network/timeout/5xx/401 | fallback + demo 허용일 때만 데모 전환. A01은 세션 초기화 전용 예외이며 일반 POST 재실행 규칙에 확대하지 않음 |
| 실제 쓰기 실패 (생성 API 포함) | 원래 오류 반환, mock 재실행/자동 재시도 없음 |
| 400/404/422/application error/contract error | 원래 오류 유지 |
| 취소/이전 generation | 전환 없이 canceled 오류로 폐기 |
| mock handler 오류/누락 | 오류 반환, 재귀 fallback 없음 |

전환을 유발한 조회를 예전 userId 그대로 재실행하지 않는다. runtime은 전환을 알리고 해당 요청을 canceled로 종료하며 앱 재초기화가 새 요청을 만든다. request의 catch는 transport 실패에만 적용한다. 모듈의 envelope/DTO 검사와 화면 예외는 fallback 대상이 아니다. ApiError는 kind/httpStatus/endpointId/message/cause를 보존하고 token/cookie가 포함된 원본 객체를 콘솔에 출력하지 않는다.

## mock 정책과 서버 구현의 차이

- 소유자 검증은 향후 백엔드에서 추가한다. 현재 검증 유무에 맞춘 프론트 분기나 mock 전용 소유자·공개 여부 검증을 추가하지 않는다. 백엔드가 거부하면 반환된 오류를 처리한다.
- 방 생성·삭제의 권한 판정도 백엔드 책임이다. API 분리 과정에서 프론트 API 모듈에 ADMIN 검사를 추가하지 않는다.
- 서버에는 draft 상태 필드가 없다. 임시저장은 빈 summary/빈 category로 저장하고 홈 목록과 전체 count에 포함한다. mock의 내부 draft 표식은 wire에 노출하지 않는다. 임시저장에는 category를 만들지 않아 통계에서 제외하고, 정상 수정 시 category를 생성한다.
- 임시저장도 shared=true이면 서버 광장 query에 포함될 수 있다. mock은 공유 가능한 완성 꿈만 노출한다는 계획을 유지하며 이 차이를 명시한다.
- 꿈 삭제의 category/comment, 댓글 삭제의 like는 entity cascade 설정으로 연결된다. mock도 함께 제거하고 통계를 현재 데이터에서 재계산한다. 실제 DB cascade 실행은 검증하지 않았다.
- 서버 광장의 없는/비공개 꿈은 400(InvalidDreamException), 없는 댓글도 400이다. mock도 해당 HTTP 계약을 유지한다. 꿈 상세와 방 상세의 없는 ID는 404다.
- 통계의 characters/locations/objects는 상위 3개, moods는 전체다. mock은 고정 category로 계산하고 실제 AI 해몽/해시태그 정확성을 보장하지 않는다.
- 알림은 별도 외부 HTTP 모듈과 구독 상태 stub으로 분리한다. mock에서는 Firebase 초기화/권한 요청 및 실제 Socket.IO 연결을 생략한다. 방은 정적 상세와 로컬 상태를 제공한다.

## 검증 상태와 다음 작업

이번 변경은 문서만 수정한다. controller mapping, DTO 필드, service의 날짜·cursor·집계, entity cascade, 보안 설정, nginx/compose를 정적으로 대조했다. 실제 서버 호출·DB 실행·운영 proxy·직렬화 실행 검증은 수행하지 않았다.

다음 커밋은 기존 동작을 유지하는 최소 공통 설정/client 정리와 URL 검증이다. 이후 업무별 API 선언을 분리하고 호출부를 이관한다. request/error의 확장, mock·세션·자동 fallback은 보류한다. API 모듈 검증에서 위 wire 예시를 확인하고, 운영 연결 검증은 실제 환경이 준비된 경우 별도로 결과를 기록한다. 기존 package.json/package-lock.json 사용자 변경은 각 커밋에서 제외한다.

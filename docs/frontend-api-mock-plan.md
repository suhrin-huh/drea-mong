# Frontend API 중앙 관리 및 API별 Mock 설계 계획

작성일: 2026-10-22. 현재 frontend와 대응하는 backend 컨트롤러·DTO를 조사한 구현 전 계획이다. 이 문서 작성 단계에서는 API 코드나 페이지 동작을 변경하지 않는다.

2026-10-26: 10절의 첫 커밋 단위에 해당하는 [구현 계약](./frontend-api-contract.md)을 작성했다(검토 대기). URL 결합·A01~A22 요청/응답·fallback·세션·메모리 데이터 수명과 서버/mock 차이는 해당 문서를 기준으로 검토한다. 아래 초기 제안과 차이가 있는 부분은 구현 계약에 명시했다. 운영 프록시 및 실제 서버 응답 검증은 아직 수행하지 않았다.

## 현재 적용 범위 (2026-10-26 수정)

현재 검토 단위는 공용 Axios instance의 baseURL, token interceptor, JSON/파일 등 Content-Type 처리, 원본 응답·오류 전달과 사용 예시다. mock 연결과 호출부 전면 이관은 하지 않으며 승인 후 다음 커밋 범위를 진행한다.

이번 작업은 **기존 동작을 유지하면서 API 선언과 통신 코드를 업무별 모듈로 분리하는 것**을 우선한다. 아래 장기 계획 중 범위가 충돌하는 내용은 이 절을 우선한다.

- method/path/query/body, 공통 client 설정과 응답 계약 처리를 API 계층으로 이동한다. 호출부는 해당 메서드를 사용하도록 필요한 만큼만 수정한다.
- 기존 페이지의 로그인·권한 UI·상태·라우팅·데이터 가공은 가능한 한 유지한다. API 분리에 필요한 오류 수정만 해당 커밋에서 설명한다.
- 소유자 검증은 백엔드 책임이다. 현재 검증 유무를 프론트 이관의 선행 조건으로 삼지 않으며, 향후 백엔드가 반환하는 오류는 기존 오류 처리 흐름으로 전달한다. 프론트 API 계층에 소유자·역할 판정이나 요청 차단을 추가하지 않는다.
- mock에도 별도의 소유자 정책을 구현하지 않는다. 권한 오류 확인이 필요하면 지정한 endpoint의 403 응답 시나리오로 검증한다.
- mock/store, 자동 fallback, 개발 세션·인증 우회, 공통 접근 제어 재설계는 API 분리 이후의 후속 범위로 보류한다. 기존 fallback/인증 동작도 이번 분리에서 전면 변경하지 않는다.
- 당장의 순서는 계약 문서 정리 → 최소 공통 설정/client 정리 → 업무별 API 선언 분리 → 기존 호출부 이관 → 관련 검증·사용 문서다. 10절의 mock·세션 작업 및 이를 전제로 하는 완료 기준은 후속 범위이며, 각 커밋은 계속 검토·승인 후 생성한다.

## 1. 목표와 기본 방향

- URL, HTTP method, 인증 헤더, 요청 파라미터와 통신 응답 계약 처리를 페이지·컴포넌트에서 제거하고 `shared/api`에서 중앙 관리한다. 도메인·화면 데이터 변환은 사용하는 계층에 남긴다.
- API를 하나의 큰 파일에 넣지 않고 업무 영역별 모듈로 나눈다. 페이지는 `dreamsApi.getMonthlyDreams(...)`처럼 공개 메서드만 호출한다.
- 개발 환경에서는 API 모드에 따라 실제 서버·fallback·mock을 선택한다. 인증·권한 우회 설정을 켜면 인증 실패를 기다리지 않고 앱에 바로 진입한다. 실제 요청 실패에 따른 mock 전환 정책은 별도로 유지한다.
- 모든 대상 API에 대응하는 mock handler를 제공한다. 조회뿐 아니라 작성·수정·삭제·좋아요 후 다시 조회하는 흐름도 작동하도록 한다.
- 실제 데이터와 mock 데이터가 섞이지 않도록 세션과 데이터 출처를 관리한다. mock 토큰을 실제 서버에 보내지 않는다.
- 프로덕션에서는 mock을 실행하지 않고 정상적인 오류 처리·인증 흐름을 유지한다.

기존 React/Recoil/Axios를 유지한다. 이번 단계는 API 중앙 관리·API별 mock·개발 인증 우회까지다. TanStack Query 도입과 캐싱 정책은 후속 단계로 분리한다. 이번에는 query key, staleTime, gcTime, QueryClient, 캐시 무효화나 별도 요청 캐시를 구현하지 않는다. 라이브러리 도입 전에 순수 API 함수의 계약과 AbortSignal 전달만 준비한다.

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
    │   ├── api-config.js            # URL, mode, timeout, 개발 세션 설정
    │   └── auth-config.js           # 개발 환경 인증·권한 우회 판정
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
| modules의 업무별 api 모듈 | 실제 endpoint 호출, method/path/query/body, 서버 DTO·성공 상태·특수 HTTP 계약 처리 | 도메인 모델 변환·화면 형식·React·캐시·직접 스토리지 조작 |
| entity의 model/lib | 여러 곳에서 공유하는 도메인 모델 변환·규칙 | 화면 전용 문자열·HTTP 설정 |
| 사용하는 page/feature의 model/lib | 화면 전용 가공·한 곳에서만 필요한 데이터 변환 | API 경로·공통 transport·캐시 구현 |
| mock transport/handlers | 같은 HTTP 계약의 mock 응답·오류 | 임의의 성공 응답·상위 계층 의존 |
| SessionProvider | 우회 설정에 따른 개발 사용자 주입 또는 실제 사용자 초기화, 실제/데모 세션 구분 | HTTP 경로별 세부 규칙 |
| page/feature | loading·입력·검증·최종 오류 UI·완료 후 이동 | Axios 설정·URL 문자열·mock 분기 |

```text
page / feature
    → 업무별 API 메서드
        → request(endpoint ID, method/path/params/data)
            → live: http-client
            → mock: 개발용 mock transport → handler → mock-store
        → 서버 통신 계약 처리
    ← 서버 DTO 또는 정규화된 통신 오류
    → 필요할 때 entity의 도메인 변환
    → 사용하는 page/feature의 표시용 가공
```

fallback의 catch 범위는 전송 결과에 한정한다. UI 코드, 응답 변환 코드, 계약 검증 코드의 오류까지 같은 catch로 감싸지 않는다. 취소된 요청은 mock 전환을 유발하지 않는다.

호출 예시와 반환 계약:

```js
import { dreamsApi } from '@/shared/api/modules/dreams.api';

const { dreamMainResponsesList, totalCount } = await dreamsApi.getMonthlyDreams({
  userId,
  year,
  month,
  signal,
});
```

API 모듈은 통신 envelope를 처리한 서버 DTO를 반환하며 `dreamMainResponsesList` 같은 서버 필드명을 화면 취향에 맞춰 바꾸지 않는다. 동일 메서드는 live/mock에서 같은 반환 형태를 보장한다. JavaScript와 JSDoc으로 인자·반환값·nullable 항목을 문서화한다.

### 4.1 응답 변환의 책임 경계

| 변환 | 담당 | 예시 |
| --- | --- | --- |
| 통신 계약 | shared/api 공통 코드와 modules | Axios response에서 body 추출, 성공 status 검사, 204 처리, Authorization header 읽기 |
| 도메인 모델 | entities/<대상>/model 또는 lib | 반복 사용하는 서버 DTO → Dream 모델, 공유 필드·날짜 의미의 정규화 |
| 표시 형식·화면별 조합 | 사용하는 page/feature의 model 또는 lib | YYYYMMDD를 한국어 날짜로 표시, 차트 dataset, 그룹화·화면 문구 |

`shared/api` 루트의 http-client/request는 공통 기능만 소유하고, 실제 endpoint 요청은 modules가 소유한다. 모든 변환을 shared/api로 모으지 않는다. 서버 오류를 숨기지 않기 위한 최소 계약 검사는 API 경계에서 할 수 있지만, 비즈니스 모델을 정의하거나 화면용 필드를 만들어 반환하지 않는다.

entity 변환 계층을 모든 API 앞에 의무적으로 추가하지 않는다. 한 화면에서만 쓰는 단순 변환은 해당 사용처에 두고, 여러 곳에서 같은 도메인 규칙을 공유할 때 entity로 추출한다. shared/api는 이 변환 함수를 import하지 않는다.

서버 데이터와 클라이언트 상태도 구분한다. 이번에는 페이지의 기존 조회 상태를 API 호출 이관에 필요한 만큼만 수정하고, 서버 상태를 TanStack Query로 옮기는 작업은 다음 단계로 남긴다.

### 4.2 후속 Query 도입을 위한 최소 API 계약

```js
// React·Recoil·라우팅·QueryClient에 의존하지 않는 함수
dreamsApi.getDream({ dreamId, signal }); // Promise<DreamResponseDto>
```

- 명시적인 인자를 받아 Promise로 데이터를 반환하거나 오류를 던진다. UI 상태 변경·navigate·모달을 실행하지 않는다.
- AbortSignal을 Axios와 mock 지연 처리까지 전달한다. 취소를 fallback 오류로 해석하지 않는다.
- 성공 조회는 null/빈 배열 등 명시한 값을 반환하고, undefined는 의도적인 void 명령에만 사용한다.
- 응답 배열·객체를 예기치 않게 변경하지 않는다. 이후 Query가 보유할 데이터를 API 함수가 수정하지 않도록 한다.
- API 함수에 query key, staleTime, gcTime, 재조회·캐시 무효화·자동 쓰기 재시도를 넣지 않는다.
- mock-store는 가상 서버의 원본 데이터다. 클라이언트 Query 캐시와는 별개이며, 지금 별도 클라이언트 캐시를 추가하지 않는다.

## 5. 중앙 client와 응답 계약

### 5.1 설정

제안하는 환경변수:

| 설정 | 의미 | 기본 제안 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드의 외부 API base URL | 실제 prefix 확인 후 `.env.example`에 예시 제공 |
| `VITE_SOCKET_URL` | 실제 소켓 주소 | 기존 주소를 별도 설정으로 이동 |
| `VITE_API_MODE` | live / fallback / mock | 개발 fallback, 프로덕션 live 강제 |
| `VITE_BYPASS_AUTH` | 개발 환경에서 프론트 인증·권한 검사 우회 | 명시적으로 true인 경우에만 활성화, 미설정 시 false |
| `VITE_ENABLE_DEMO_SESSION` | 우회하지 않을 때 인증 실패 후 데모 세션 전환 허용 | 별도 선택 설정. bypass가 true이면 개발 사용자 진입에 불필요 |
| `VITE_API_TIMEOUT_MS` | 실제 요청 최대 대기 시간 | 초기 제안 5,000ms, 화면 요구에 따라 조정 |

`import.meta.env.DEV`와 개발용 설정을 모두 만족할 때만 mock/데모를 활성화한다. 프로덕션 빌드에 `VITE_API_MODE=mock`을 넘겨도 live로 동작해야 한다. mock 모듈은 DEV 분기 내부에서만 dynamic import하고, 빌드 산출물에 mock dataset·개발 이미지를 포함하지 않는지 검사한다.

`server.atoms.js`의 URL atom은 호출부 이관이 끝난 후 제거한다. 환경 설정은 UI 상태로 관리하지 않는다. 배포 시 환경변수가 빌드 시점에 반영된다는 점도 README에 명시한다.

### 5.2 개발 환경 전용 인증·권한 우회 설정

추가 논의에서 확정한 방향은 **개발 모드 판정과 명시적인 환경변수 설정을 함께 사용하는 것**이다. 개발 서버라는 이유만으로 항상 인증을 생략하지 않고, 실제 인증을 테스트할 때는 우회를 끌 수 있게 한다.

```dotenv
# frontend/.env.development.local
VITE_BYPASS_AUTH=true
VITE_API_MODE=mock
```

```js
// shared/config/auth-config.js — 구현 예정 예시
export const bypassAuth =
  import.meta.env.DEV &&
  import.meta.env.VITE_BYPASS_AUTH === 'true';
```

- 환경변수는 문자열이므로 `'true'`와 비교한다. 문자열 `'false'`를 Boolean으로 변환해 활성화하지 않는다.
- `import.meta.env.MODE === 'development'`만으로 판단하지 않는다. Vite의 mode와 개발·프로덕션 판정은 별개다.
- 일반적인 `vite build` 및 `vite build --mode development`는 NODE_ENV를 따로 바꾸지 않으면 프로덕션 빌드다. 배포 빌드는 NODE_ENV=production 기본값을 유지하고, `NODE_ENV=development vite build` 같은 비표준 조합은 빌드 설정에서 거부하도록 한다.
- 프로덕션 build에서 우회 flag가 true여도 인증·권한 검사를 수행한다. API mode도 live로 고정한다.
- `.env.development.local`은 개인별 로컬 설정으로 Git에서 제외한다. 공유용 변수와 사용 예시는 `.env.example`·README에 기록한다.
- 환경변수 변경 후 개발 서버를 재시작한다. VITE_ 변수에 비밀키나 실제 사용자 token을 넣지 않는다.

설정의 책임은 독립적으로 유지한다.

| 설정 | 제어 대상 | 제어하지 않는 대상 |
| --- | --- | --- |
| VITE_BYPASS_AUTH | 프론트 페이지 접근·로그인 이동·권한에 따른 UI/조작 제한 | 실제 백엔드의 인증·권한 검사 |
| VITE_API_MODE | 요청의 데이터 공급원: live / fallback / mock | 프론트 접근 제어 자체 |
| VITE_ENABLE_DEMO_SESSION | 우회가 꺼진 개발 환경에서 인증 실패 후 데모 전환 허용 | 모든 권한 검사 무조건 생략 |

| 개발 설정 | 프론트 동작 | API 동작 |
| --- | --- | --- |
| bypass=true + mock | 처음부터 개발 사용자로 진입, 모든 화면·관리 UI 확인 | 실제 서버 요청 없이 mock 사용 |
| bypass=true + fallback | 처음부터 개발 사용자로 진입 | 실제 요청 우선. 조회의 인증 오류·연결 실패 시 개발 mock 전환. 실제 쓰기 실패는 6.2절 정책 유지 |
| bypass=true + live | 프론트 인증·권한 검사 생략 | 실제 서버만 사용. 서버의 401/403은 오류로 남음 |
| bypass=false + live/fallback | 실제 인증·권한 흐름 적용 | 기존 API 모드 정책 적용. 데모 전환은 별도 허용 설정에 따름 |
| bypass=false + mock | mock 세션 설정에 따라 데모 사용자로 인증 상태를 구성하고 권한별 UI 확인 | mock 사용. 데모 허용 없이 세션을 구성할 수 없는 설정 조합은 명확한 설정 오류로 표시 |
| 프로덕션 | 항상 실제 인증·권한 흐름 | 항상 live |

프론트 우회는 백엔드 권한을 부여하는 기능이 아니다. 실제 API를 테스트할 때는 유효한 실제 인증 정보가 필요하다. 우회 상태에서 반환된 실제 401/403 때문에 다시 로그인 페이지로 이동해 화면 개발이 중단되지 않도록, 세션 계층은 우회 정책에 따라 오류를 표시하거나 허용된 mock 전환을 수행한다.

설정 의미의 근거는 [Vite 환경변수와 모드 공식 문서](https://vite.dev/guide/env-and-mode)다.

판정은 shared/config 한 곳에서 수행하고 app의 세션·접근 제어에 연결한다. 페이지에 DEV 분기를 반복 추가하지 않는다. feature에 남아 있는 권한별 버튼·조작 제한도 동일한 접근 정책을 사용한다.

### 5.3 인증과 오류

- 앱 백엔드 client에서만 실제 accessToken을 주입한다. Google 등 외부 호스트에 앱 token을 붙이지 않는다.
- `withCredentials`는 Axios 설정 위치에서 관리한다. 현재 headers 안에 들어간 잘못된 설정은 이관 시 바로잡는다.
- client는 직접 로그인 페이지로 이동하지 않는다. 오류를 반환하고 상위 세션 계층이 처리한다.
- `ApiError`는 최소한 `kind`, `httpStatus`, `endpointId`, `message`, `cause`를 유지한다. token·cookie를 로그에 출력하지 않는다.
- 오류 유형은 network, timeout, unauthorized, forbidden, not-found, validation, server, application, contract, canceled 등으로 구분한다.
- 전역 무한 refresh나 모든 요청 자동 재시도는 도입하지 않는다. refresh 자체의 실패와 인증 초기화 흐름부터 명확히 한다.

### 5.4 특수 응답

- 대부분의 컨트롤러는 `{ status, data }` 형태다. `data`만 일괄 추출하면 오류 status나 좋아요 결과를 잃으므로 endpoint별 성공 상태를 검사한다.
- HTTP 200이어도 `status: 'error'`면 성공 처리하지 않는다.
- 빈 방 목록의 204는 정상적인 `[]`로 변환하며 mock으로 대체하지 않는다.
- 인증 refresh는 body가 아니라 Authorization header에서 token을 읽는다. 공개 반환값은 실제 세션과 데모 세션을 구분하는 union으로 정한다.
- create/update/delete처럼 응답 data가 없는 명령은 `Promise<void>`를 기본으로 한다. 실제 응답에 없는 ID를 mock 반환값에만 추가하지 않는다.
- 댓글 좋아요의 `like`/`unLike`는 성공 결과이므로 통신 계층에서 status를 잃지 않도록 반환 계약에 보존한다. `{ liked: boolean }` 같은 앱 모델이 필요하면 comments entity 또는 해당 feature의 변환 함수에서 만든다.
- `isShared`/`shared`처럼 Java DTO와 frontend 사용명이 다른 항목은 실제 직렬화 응답을 확인해 서버 DTO 계약을 기록한다. 앱의 isShared로 통일할 필요가 있으면 사용하는 계층의 adapter에서 변환하며 shared/api에 도메인 모델을 넣지 않는다.

## 6. 개발 모드와 fallback 정책

| 모드 | 실제 요청 | mock 동작 | 용도 |
| --- | --- | --- | --- |
| live | 수행 | 사용 안 함 | 서버 통합·오류 확인 |
| fallback | 실제 요청으로 시작. 인증 초기화 여부는 bypass 설정에 따름 | 허용된 실패 시 mock 세션으로 전환 | 서버 불안정 중 개발 |
| mock | 수행하지 않음 | 시작부터 mock 세션 | UI·상호작용의 재현 가능한 개발 |

프로덕션에서는 모드 설정과 무관하게 live만 허용한다.

### 6.1 자동 전환 허용 범위

| 상황 | 제안 정책 |
| --- | --- |
| 조회 요청의 네트워크 오류·timeout·5xx | 개발 fallback에서 자동 mock 전환 |
| 인증 초기화의 401/403 또는 token 없음 | 우회가 켜져 있으면 인증 초기화 자체를 생략. 우회가 꺼져 있으면 DEV + 데모 세션 허용일 때만 전환 |
| bypass=true + fallback 상태의 실제 조회 401/403 | 개발 mock 세션으로 전환. 실제 쓰기는 6.2절 정책을 유지하고 자동 mock 재실행하지 않음 |
| 정상 응답의 빈 배열·204 | 그대로 정상 처리 |
| 400/422 등 입력 오류 | 오류 표시. 성공 mock으로 덮지 않음 |
| 404 | 기본적으로 오류 표시. 존재하지 않는 상세 데이터는 생성해 주지 않음 |
| 우회하지 않은 세션의 권한 조작 403 | 권한 오류 유지. 일반 사용자를 자동 ADMIN으로 바꾸지 않음 |
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

1. 앱 시작 시 공통 설정에서 bypassAuth를 먼저 판정한다. 초기화가 끝나기 전에는 사용자 의존 요청을 보류한다.
2. 우회가 켜져 있으면 실제 로그인·refresh·사용자 인증 API 성공을 기다리지 않고 고정 개발 사용자를 주입한다. 앱 진입을 위해 임의의 가짜 token을 생성하거나 localStorage에 넣지 않는다.
3. 우회 상태에서는 보호된 페이지 접근, 로그인 리다이렉트, 관리자 UI와 작업에 대한 프론트 권한 제한을 공통 정책으로 생략한다. userId·nickname·role 등 화면 렌더링에 필요한 데이터는 개발 프로필이 제공한다.
4. 권한 우회는 role 문자열을 무조건 ADMIN으로 바꾸는 방식 대신 `bypassAuth || 실제 권한 판정` 형태의 공통 정책으로 적용한다. role별 화면을 검증할 때는 우회를 끄고 일반 사용자/ADMIN 프로필을 선택한다.
5. 소유자·역할 검증은 백엔드 책임으로 두며 프론트 API 계층과 mock에 별도 검증을 추가하지 않는다. 권한 오류는 endpoint별 오류 시나리오로 재현한다. 세션·우회 기능 자체는 현재 API 분리 이후로 보류한다.
6. 우회하지 않은 live에서는 실제 token/refresh와 사용자 정보를 확인하고 실패 시 실제 로그인 흐름으로 이동한다. fallback은 VITE_ENABLE_DEMO_SESSION이 허용할 때만 인증 실패 후 데모로 전환한다.
7. mock 데이터 모드와 인증 우회는 같은 flag로 묶지 않는다. 인증 우회를 켜도 live API의 요청이 성공하는 것은 아니다. 개발 사용자와 실제 서버 사용자의 ID도 같다고 가정하지 않는다.
8. `authApi.refreshSession()`의 공개 결과는 실제 token이 있는 authenticated 결과와 token이 null인 demo 결과를 구분한다. 우회가 켜진 초기 진입에서는 이 메서드를 호출할 필요가 없다.
9. 실제 token을 개발 사용자 상태로 덮어쓰지 않는다. mock transport는 실제 token을 사용하지 않으며, 우회를 끄거나 실제 세션으로 복귀할 때는 사용자를 재초기화한다.
10. OAuth 제공자 페이지로 이동하는 동작은 일반 HTTP fallback 대상이 아니다. 우회 상태에서도 실제 OAuth를 테스트하려면 우회를 끄고 실제 로그인 흐름을 선택한다.
11. 보호된 페이지·SettingsPage·관리 기능은 token 문자열 유무 대신 공통 세션과 접근 정책을 소비한다. UI는 session kind와 API source를 구분하고, 개발 상태 표시에서 인증 우회 여부도 보여준다.
12. API 모드 전환·로그아웃·개발 사용자 초기화가 명시적으로 작동하게 한다. 로그아웃 직후 같은 렌더에서 개발 사용자를 자동 재주입해 종료 동작이 무효화되지 않도록 세션 초기화와 로그아웃을 구별한다.

## 8. 현재 사용 중인 API 22개와 mock 생성 계획

경로는 컨트롤러 기준이며 배포 prefix를 포함하지 않는다. 생성 API의 `/api`는 해당 컨트롤러의 실제 mapping이다. 최종 외부 URL은 5절의 설정 검증에서 확정한다.

| ID | 모듈·메서드 제안 | HTTP / 경로 | mock 응답 및 상태 변화 |
| --- | --- | --- | --- |
| A01 | authApi.refreshSession | POST `/auth/refresh` | 실제 token 없는 demo 결과. 우회 초기 진입에서는 호출 생략, 인증 실패 시나리오 별도 제공 |
| A02 | usersApi.getCurrentUser | GET `/users/info` | 선택한 데모 프로필의 userId/email/nickname/role |
| A03 | usersApi.logout | POST `/users/logout` | mock 세션 종료, 상위 계층에서 사용자 상태 초기화 |
| A04 | usersApi.updateNickname | PATCH `/users/nickname` | 해당 사용자의 nickname 갱신. 재조회와 댓글 표시에도 반영 |
| A05 | dreamsApi.getMonthlyDreams | GET `/dream/{userId}/{writeTime}` | 사용자·월로 필터한 목록과 totalCount. writeTime 형식 검증 |
| A06 | dreamsApi.createDream | POST `/dream/create` | 새 ID를 내부 할당해 저장. 응답은 실제 API처럼 성공·빈 data |
| A07 | dreamsApi.getDream | GET `/dream/{dreamId}` | 동일 store의 content/image/interpretation/summary/공유 여부/userId/writeTime. 없는 ID는 404 |
| A08 | dreamsApi.updateDream | PUT `/dream/{dreamId}` | 갱신. 홈·상세·광장 재조회에 반영 |
| A09 | dreamsApi.deleteDream | DELETE `/dream/{dreamId}` | 삭제. 연관 댓글 정리·광장 제외 |
| A10 | dreamsApi.saveDraft | POST `/dream/temporary` | 하위 필드가 비어 있을 수 있는 임시 꿈 저장. 통계 제외 규칙 적용 |
| A11 | generationApi.generateImages | POST `/api/generate-image` | 로컬 샘플 이미지 4개, 검열로 빈 항목이 있는 경우·전체 실패 시나리오 |
| A12 | generationApi.generateInterpretation | POST `/api/generate-interpretation` | 입력에 대응하는 고정 seed의 한국어 해몽 문자열. 짧은 입력 오류 시나리오 |
| A13 | squareApi.getDreams | GET `/square/dreams` | 같은 꿈 store의 공개 데이터만 cursorId/size 기준으로 반환 |
| A14 | squareApi.getDream | GET `/square/{dreamId}` + userId query | summary/content/image/comments, 현재 사용자 기준 소유·좋아요 여부 |
| A15 | commentsApi.createComment | POST `/comments/create` | dreamId/userId 관계 검사 후 댓글 추가. 성공·빈 data |
| A16 | commentsApi.toggleLike | POST `/comments/{userId}/{commentId}/like` | 사용자별 좋아요 토글. wire status like/unLike, 재조회 count와 일치 |
| A17 | commentsApi.deleteComment | DELETE `/comments/{commentId}` | 삭제. 없는 ID·지정 오류 시나리오 제공 |
| A18 | statisticsApi.getMonthlyStatistics | GET `/statistics/{userId}/{currentDate}` | 선택 월의 objects/characters/locations/moods/dreamTypeCounts. 데이터 없는 월은 빈 배열 |
| A19 | roomsApi.getRooms | GET `/rooms` | 동일 방 store의 목록. 빈 목록은 204 시나리오 지원 |
| A20 | roomsApi.getRoom | GET `/rooms/{roomId}` | roomId/title/youtubeLink/thumbnail/participantCount, 없는 ID는 404 |
| A21 | roomsApi.createRoom | POST `/rooms` | 방 생성. 실제처럼 201·성공 응답 |
| A22 | roomsApi.deleteRoom | DELETE `/rooms/{roomId}` | 삭제. 목록·상세에 반영 |

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
| 꿈 | 작성자 ID, 날짜, 공유 여부, 임시 저장 상태를 보존. 개발 접근 우회가 데이터 소유 관계 자체를 변경하지 않음 |
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
- 사용자/ADMIN 프로필과 endpoint별 403 오류 시나리오.
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
   - A01~A22 실제 요청 모듈과 통신 계약 처리, 외부 알림 HTTP 경계 추가. 서버 DTO 반환을 유지하고 필요한 도메인·화면 변환은 상위 사용처에 둔다. 먼저 live로 검증.
4. `feat: API별 mock handler와 데이터 저장소 추가`
   - seed/factory/store, 22개 handler, 외부 알림 stub, CRUD·cursor·권한·통계 시나리오.
5. `feat: 개발 mock 세션과 자동 fallback 적용`
   - API 모드와 별도의 인증·권한 우회 설정, 개발 사용자 초기 주입, 공통 접근 정책, generation 전환·이전 응답 무시, 개발 출처·우회 상태 표시.
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
- live/mock 메서드가 같은 서버 DTO·특수 응답 계약을 충족하고, API에 없는 필드를 mock에만 요구하지 않는다. 도메인·표시용 변환이 통신 계층으로 유입되지 않는지 확인한다.
- 조회 실패 전환, 400/404 유지, 인증 데모 허용 여부, AbortSignal 취소, 계약 오류 미은폐, mock handler 누락을 검사한다.
- 개발 flag의 미설정/false/true를 검사한다. 문자열 false로는 우회되지 않아야 한다.
- bypass=true이면 실제 인증 초기화 없이 개발 사용자가 준비되고, 페이지 및 feature의 권한 제한도 같은 정책을 사용한다. bypass=false이면 실제/데모 세션의 권한 검사가 복원된다.
- 우회 상태의 live 401/403은 mock 성공으로 바뀌지 않고, fallback에서는 허용된 개발 세션 전환으로 처리된다. 실제 쓰기 실패의 자동 재실행 금지 규칙은 유지한다.
- 실제 쓰기 timeout이 mock 성공으로 바뀌거나 중복 재실행되지 않는다.
- source generation 전환 뒤 늦은 실제 응답이 mock 사용자·데이터를 덮지 않는다.
- CRUD 후 목록/상세·광장·댓글·좋아요·통계 관계가 일치한다. reset 후 초기 seed가 복원된다.
- 기준 날짜·seed를 고정하면 같은 dataset이 재현된다. 페이지에서 반환 배열을 바꿔도 store 원본은 유지된다.

### 화면 검증

- 개발 bypass=true + mock에서 실제 인증·token 수동 조작 없이 홈·작성·편집·광장·통계·설정·방 목록/상세와 관리자 UI에 진입한다.
- bypass를 끄면 로그인 이동과 사용자/ADMIN별 접근 제한이 정상적으로 복원된다. 환경변수 변경 시 개발 서버 재시작 절차도 확인한다.
- 작성 → 홈 조회 → 편집 → 공유 → 광장 상세 → 댓글/좋아요 → 삭제까지 동작한다.
- 실제 서버 없는 fallback 초기화와 live 실패가 정해진 규칙대로 작동한다.
- 우회하지 않은 모드에서 사용자/ADMIN 차이를 검증하고, 우회 모드에서는 role과 무관한 개발 접근을 검증한다. 빈 화면·오류 화면·로딩 상태와 개발 출처·우회 상태 표시도 확인한다.
- mock 화면이 Firebase 권한·실제 Socket.IO 연결·외부 thumbnail 실패에 막히지 않는다. 외부 iframe의 실재생 성공은 별도 항목이다.
- 미지원 음성 인식 환경에서 입력 화면 자체가 중단되지 않는다.

### 구조와 빌드 검증

- `npm run build`와 `node scripts/check-structure.mjs`가 통과한다.
- mock dataset·개발 이미지·handler가 production chunk에 포함되거나 실행되지 않는지 확인한다.
- 프로덕션 빌드에서 bypass flag와 mock mode가 true로 설정돼도 우회가 비활성인지 검사한다. 일반 `vite build --mode development`도 검사하며, NODE_ENV=development인 build 명령은 거부하는지 확인한다.
- page/feature의 `axios` import, 백엔드 URL 문자열, 공용 백엔드 호출의 직접 fetch가 남지 않는다. Socket.IO·SDK 등 별도 경계는 구분한다.
- shared/api가 상위 FSD 계층을 import하지 않으며 API 요청 경로·자산 대소문자와 공개 export가 정상이다.
- lint는 현재 기준 오류 341건·경고 78건과 비교한다. 이번 작업이 건드린 API·세션·mock 코드의 신규 오류를 남기지 않는다. 관련 없는 전체 lint 해소는 별도 범위다.
- 기존 URL atom과 HomePage 전용 fallback을 제거하고, 실패 로그에 token·cookie가 노출되지 않는다.

## 12. 구현 전 확인할 선택사항

개발 환경에서만 인증·권한을 우회할 수 있게 한다는 방향과 API 모드와의 분리는 추가 논의에 반영했다. 아래의 나머지 기본값·데이터 수명·외부 연동 범위는 구현 시작 전에 확정한다.

| 항목 | 권장안 | 대안 |
| --- | --- | --- |
| mock 범위 | 조회 + 세션 내 CRUD | 우선 조회 전용으로 축소 |
| 개발 기본 모드 | fallback, live/mock 선택 가능 | 처음부터 mock 고정 |
| 데이터 수명 | 새로고침 시 초기화되는 메모리 | 버전이 있는 sessionStorage |
| 개발 인증·권한 우회 | DEV + VITE_BYPASS_AUTH=true일 때 초기 진입부터 우회 | 개발에서도 우회를 끄고 실제 인증·권한 검사 |
| 우회하지 않을 때 인증 실패 | 별도 데모 허용 설정일 때만 전환 | 실제 로그인 필수 |
| 실제 쓰기 실패 | 원래 오류 유지, 자동 mock 재실행 금지 | 별도 중복 처리 설계 후 확대 |
| 소켓 | 1차 실제 연결 차단·정적/로컬 표시 | 별도 가상 소켓 adapter 구현 |
| 알림 | 설정 변경 stub | 실제 FCM 연동은 별도 개발 환경에서 검증 |

특히 실제 backend의 외부 prefix와 DTO 직렬화, 삭제 시 연관 데이터·통계 정책은 controller/service 및 실제 응답을 함께 확인해 최종 계약표에 반영한다. 문서의 mock 정책을 실제 서버 동작이 확인된 것처럼 취급하지 않는다.

## 13. 단계별 범위와 후속 작업

| 단계 | 목표 | 구현 범위 | 이번 단계에서 제외 |
| --- | --- | --- | --- |
| 1 — 현재 | API 중앙 관리와 API별 mock | 공통 client/request, 업무별 요청 modules, 통신 계약, 22개 mock, 개발 인증·권한 우회, 순수 API 함수와 signal 전달 | Query 설치·캐시·서버 상태 전면 이관 |
| 2 — 다음 | TanStack Query를 한 기능부터 도입 | QueryClient/Provider, query key 기본 구조, 조회·loading/error 이관, mutation과 최소 무효화 | 전체 화면 동시 교체·영속 캐시·일괄 낙관적 갱신 |
| 3 — 이후 | 데이터 특성별 캐싱 전략 조정 | staleTime/gcTime, focus/reconnect 정책, mutation 영향 범위, 필요한 pagination·소켓 연계 | 근거 없는 전역 최적화 |

후속 작업의 상세 단계·예시 정책·검증 기준은 별도 [TanStack Query·캐싱 후속 계획](./frontend-query-cache-plan.md)으로 관리한다. API와 mock 계약이 검증되기 전에는 Query 도입을 시작하지 않는다. API 이관과 상태관리 변경을 분리해 오류 원인을 추적할 수 있게 한다.

위 순서는 논의한 작업 경계를 기록한 것이며, 후속 라이브러리 설치나 구현까지 이번 문서 수정으로 시작하는 것은 아니다.

## 14. 조사 근거

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

## 15. 추가 논의 반영 내역

- Vite 개발 판정과 `.env`의 명시적 flag를 함께 사용하여 개발 전용 인증·권한 우회를 제공한다.
- 인증 오류가 나야만 데모로 들어가는 흐름과 별개로, 우회 활성화 시 앱 초기 진입부터 고정 개발 사용자를 제공한다.
- 프론트 접근 제어와 API 데이터 공급 모드는 독립적으로 설정한다. 실제 백엔드 인증·권한은 그대로 적용된다.
- 우회 판정은 shared/config, 초기 사용자와 접근 정책 연결은 앱 세션 계층에서 관리한다. 페이지마다 개발 조건을 추가하지 않는다.
- 개발 사용자와 실제 token을 분리하고, 관리자 UI 확인과 권한별 테스트를 모두 지원한다.
- 프로덕션 비활성화·문자열 flag 해석·모드 조합·우회 해제 후 권한 복원을 검증 항목에 추가했다.

- 응답의 통신 계약 처리·도메인 모델 변환·화면 표시 변환을 분리하고, modules는 실제 endpoint 호출만 담당하도록 책임 범위를 좁혔다.
- 현재 목표는 API 중앙 관리와 API별 mock으로 유지하고, TanStack Query 도입·캐시 정책은 별도 후속 계획으로 분리했다.


## 16. 브랜치와 현재 작업 상태

- `refact/fe-directory-structure`의 구조 개편과 계획 변경을 `refactor`에 병합했다.
- `refactor`에서 `feat/frontend-api-management`를 생성하여 API 중앙 관리·mock 작업을 이어간다.
- 이번 변경은 현재 계획의 책임 경계·단계 정리와 후속 Query 계획 문서화다. API·mock·Query의 실제 구현이나 새 의존성 설치는 아직 시작하지 않았다.
- 구현은 본 문서 10절 순서로 진행하고, Query 구현은 선행 API 작업 완료 후 별도 브랜치에서 수행한다.
- 기존 package.json·package-lock.json의 사용자 변경은 브랜치 이동 중에도 보존하며, 계획 커밋에 섞지 않는다.

# Frontend TanStack Query 도입 및 캐싱 후속 계획

작성일: 2026-10-22. API 중앙 관리·mock 설계 이후에 적용할 후속 작업을 기록한다. 현재 상태는 **계획 수립**이며 라이브러리 설치와 런타임 코드는 아직 변경하지 않는다.

선행 계획: [API 중앙 관리와 API별 mock](./frontend-api-mock-plan.md).

2026-10-26 갱신: 공용 Axios와 업무별 모듈, 개발 전용 목 adapter를 연결했다. 현재 공개 반환값은 AxiosResponse이며 DTO 정규화·자동 fallback·세션 Provider·runtime generation은 구현하지 않았다. 개발 기본 목과 실제 서버 전환은 `VITE_API_MOCK`으로 선택하고 재시작·새로고침으로 적용한다. 아래 Query·캐시 설계는 후속 제안이며, 미구현된 전환 장치를 현재 기능으로 전제하지 않는다. Query 라이브러리와 런타임 코드는 이번 갱신에서 변경하지 않는다.

## 1. 단계별 목표와 작업 경계

| 단계 | 목표 | 포함 | 제외 |
| --- | --- | --- | --- |
| 1 — 현재 API 작업 | 요청 경계와 개발 데이터 공급 안정화 | 공통 Axios·adapter, 업무별 modules, API 22개 목, 최소 데모 접근, 원본 응답·취소 신호 | TanStack Query 설치·캐시·서버 상태 전면 교체 |
| 2 — Query 도입 | 한 기능씩 서버 상태 관리 이관 | QueryClient/Provider, key 기본 구조, query/mutation, loading/error, 최소 무효화·세션 격리 | 전체 화면 일괄 교체, 캐시 시간 전면 최적화, 영속 캐시·낙관적 갱신 |
| 3 — 캐싱 전략 | 실제 변경 빈도에 맞춰 정책 조정 | 데이터별 staleTime/gcTime, focus/reconnect, 무효화 영향 범위, pagination·소켓 연계 | 측정 없이 전역 Infinity·polling·prefetch 적용 |

API 추출과 상태관리 변경을 한 번에 수행하지 않는다. 먼저 같은 API 함수를 live/mock에서 검증하고, 그 함수를 Query가 호출하도록 연결한다. Query가 API endpoint와 mock fixture를 직접 관리하지 않는다.

2단계에도 최소 캐시 정책과 mutation 후 무효화는 필요하다. 이를 미루어 오래된 데이터가 남는 상태로 만들지 않는다. 3단계는 기본 정합성 확보 이후의 세부 조정 단계다.

## 2. 1단계에서 준비해 둘 API 계약

```js
// 현재 API는 Promise<AxiosResponse>를 반환한다.
const response = await dreamsApi.getDream(dreamId, { signal });
return response.data.data; // Query queryFn에서 캐시에 저장할 데이터를 추출한다.
```

- API 모듈은 마지막 config의 signal을 전달하고 원본 AxiosResponse/AxiosError를 반환한다. Query의 queryFn 또는 재사용되는 소비 adapter에서 data를 추출한다. API 전체의 반환값 정규화가 필요하면 별도 계약 변경으로 진행한다.
- `shared/api`의 공통 기반은 Axios·전송·원본 오류 전달·개발 목 adapter 선택을 담당한다. 자동 fallback은 없다. `modules`가 실제 endpoint의 method/path/query/body를 담당한다.
- API 함수는 useQuery/useMutation을 호출하거나 QueryClient·Recoil·router·modal을 import하지 않는다.
- signal은 실제 HTTP와 목에 전달한다. 현재 목은 지연 종료 후 취소를 확인한다. Query 취소를 일반 오류 toast의 대상으로 처리하지 않는다.
- queryFn은 성공 시 undefined를 반환하지 않는다. 단건 없음과 빈 목록·서버 204는 자원별 계약에 따라 처리한다. API 명령 자체는 현재 void가 아닌 AxiosResponse를 반환한다.
- Query 도입 시 데이터 출처와 사용자로 key 범위를 구분한다. runtime과 세션 generation은 현재 없으므로, 실시간 계정·출처 전환이 필요할 때 도입 범위를 별도로 정한다. 비밀 token은 key나 공개 상태에 넣지 않는다.
- API에 자체 캐시·중복 요청 캐시·자동 쓰기 재시도를 추가하지 않는다.

## 3. 응답 변환과 상태의 소유권

| 책임 | 위치 | 예시 |
| --- | --- | --- |
| 전송·공통 실패 처리 | shared/api 공통 모듈 | Axios 설정, timeout, 인증 헤더, 취소 |
| 실제 API 호출·통신 계약 | shared/api/modules | URL, method, body, 성공 status, 204, token header |
| 도메인 공통 모델 변환 | entities/<대상>/model 또는 lib | 서버 DTO에서 앱의 공통 Dream 모델로 변환 |
| 화면 전용 가공 | 사용하는 page/feature의 model/lib, 필요 시 Query select | 표시 날짜, 차트 dataset, 화면 그룹화 |
| 서버 조회 데이터의 수명·재조회 | Query 계층 | query key, staleTime, loading/error, invalidate |
| 폼·클라이언트 상태 | page/feature 및 필요한 Recoil 상태 | 편집 중인 content, 모달 열림, 음성 입력 상태 |

동일한 데이터의 원본을 Query와 Recoil에 이중 저장하지 않는다. 사용자 조회 데이터는 Query로 옮길 수 있지만, 세션의 인증 종류·개발 우회·클라이언트 접근 정책까지 Query로 강제 이관하지 않는다.

Query에 서버 DTO를 저장할지 공통 도메인 모델을 저장할지는 자원별로 하나를 선택한다. entity adapter가 공통 모델을 반환한다면 queryFn에서 그 adapter를 호출한다. 표시용 데이터는 select 등 소비 경계에서 만들고, 서로 다른 모델을 같은 query key에 저장하지 않는다.

한 화면에서만 필요한 변환을 위해 entity와 adapter를 의무적으로 만들지 않는다. 서버 모델은 준비된 API 계약을 그대로 재사용할 수 있다.

## 4. 도입 전 완료 조건

- 첫 이관 기능의 API·목 응답과 화면 흐름을 확인하고, 현재 서버와 다른 요청 키·HTTP 상태·임시 저장 정책을 인지한다. 실제 서버 계약 일치를 아직 검증하지 않은 상태로 명시한다.
- 앱 백엔드 요청은 업무별 모듈을 사용하고 홈의 개별 dummy fallback은 제거한다. 외부 알림 요청은 별도 경계로 유지한다.
- `VITE_API_MOCK=false`로 기존 실제 인증 흐름을 사용할 수 있다. 독립 인증 우회 flag나 자동 fallback은 도입 선행 조건이 아니다.
- 실제 쓰기 실패를 목으로 재실행하지 않는다. Query에서도 mutation 자동 재시도를 하지 않는다.
- 현재 메모리 데이터가 새로고침 시 초기화되는 점과 Query 캐시가 별도 상태인 점을 구분한다.
- 빌드와 주요 목 CRUD 검증에 더해 첫 이관 화면의 브라우저 동작을 확인한다. 현재 브라우저·실제 서버 통합 검증은 미수행이다.
- 실시간 계정·출처 전환을 추가할 경우 진행 중 요청 취소·캐시 정리를 함께 설계한다. 현재 없는 generation 장치를 구현 완료로 보지 않는다.

이 조건을 만족한 후 호환되는 TanStack Query 버전을 확인하여 설치한다. 조사 시점의 공식 문서는 React v5 기준이지만, 설치 버전은 작업 시작 시 package·React·환경 호환성을 다시 확인하고 lockfile에 고정한다.

## 5. 2단계: TanStack Query 도입 순서

### 5.1 공통 기반

- app/providers에 QueryClientProvider를 연결한다. QueryClient는 렌더마다 재생성하지 않는다.
- 전역 기본값과 도메인별 옵션의 위치를 구분한다. 실제 QueryClient 조립은 app, 여러 곳에서 사용하는 조회 옵션은 소유 entity의 model에 둔다.
- API 모듈에는 Query 의존성을 추가하지 않는다. queryFn은 순수 API 함수 또는 entity adapter를 호출한다.
- 1차 이관에서는 조회 staleTime=0, 비활성 gcTime=5분, 자동 retry=0을 명시적인 보수적 기준으로 시작한다. 데이터별 조정은 3단계에서 한다.
- gcTime은 비활성 캐시의 수명이지 데이터 최신성 기준이 아니다. staleTime 경과 자체가 주기적인 polling을 시작하는 것도 아니다. 구체적인 재조회 트리거와 함께 판단한다.
- mutation은 자동 retry를 하지 않는다. 특히 AI 생성과 쓰기 timeout을 반복 실행하지 않는다.

위 시간 값은 이 프로젝트의 초기 제안이며 영구 확정값이 아니다. 라이브러리 기본값에 의존해서 요청이 반복되는 것을 피하고, 서버·mock 전환과 함께 검증한다. 기본 캐시 동작의 의미는 [공식 Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)를 참고한다.

### 5.2 첫 도입 자원

월별 꿈 목록을 첫 이관 대상으로 한다.

1. 사용자 세션 준비를 enabled 조건으로 표현한다.
2. userId·선택 연월·출처·세션 generation을 key에 포함한다.
3. queryFn에서 기존 dreamsApi.getMonthlyDreams를 호출하고 signal을 전달한다.
4. 기존 useEffect의 요청·loading/error·목록 복사 상태를 제거한다.
5. 월 전환·페이지 재방문·요청 취소와 목/실제 서버 각각의 동작을 비교한다. 자동 fallback은 범위 밖이다.
6. 상세 조회를 추가하고 작성·수정·삭제 mutation과 최소 무효화를 연결한다.

임의의 도메인별 캐시 시간을 전역에 먼저 적용하지 않는다. 이 첫 자원에서 key·오류·세션 정책을 검증한 다음 다른 자원으로 확대한다.

### 5.3 다음 이관 순서

| 순서 | 대상 | 검증할 주요 흐름 |
| --- | --- | --- |
| 1 | 사용자·월별 꿈·꿈 상세 | 사용자 준비, 월 변경, 작성·편집 후 조회 |
| 2 | 광장 목록·상세·댓글 | cursor pagination, 댓글·좋아요 후 동기화 |
| 3 | 통계 | 사용자·월별 key, 꿈 변경 후 통계 재조회 |
| 4 | 방 목록·상세 | 관리자 생성/삭제, 상세 진입·삭제된 방 처리 |
| 5 | 설정과 기타 명령 | 닉네임 갱신, 로그아웃·사용자 전환 |
| 별도 | 해몽·이미지 생성 | mutation으로 취급, 결과는 작성 중 폼에 반영 |

AI 생성은 입력이 같아도 재생성이라는 명시적 행동이므로 일반 GET query 캐시로 대체하지 않는다. 결과를 폼에 반영하는 책임도 유지한다.

## 6. Query 옵션과 FSD 배치

필요한 파일만 실제 이관 시 추가한다.

```text
app/
├── providers/QueryProvider.jsx
└── model/query-client.js              # 전역 정책·세션 전환 연결
entities/
└── dream/model/
    ├── dream.keys.js                 # 재사용되는 꿈 조회 key
    └── dream.queries.js              # 재사용 query options
features/
└── dream-editor/model/                # 재사용할 편집 mutation·폼 흐름
pages/
└── <slice>/model/                     # 페이지 전용 query 조합·select·완료 후 처리
shared/api/
├── http-client.js                    # Query 의존성 없음
├── modules/
└── mocks/
```

- 같은 계층의 slice를 직접 참조하거나 entity에서 page/feature를 import하지 않는다.
- 공통 조회가 필요한 user·room·comment entity는 실제 재사용 수요가 있을 때만 추가한다.
- 다른 자원의 캐시까지 갱신해야 하는 동작은 해당 자원들을 합성할 수 있는 상위 feature/page/app에서 조정한다.
- page 전용 통계 key를 하위 dream-editor에서 직접 import하는 식의 역참조는 금지한다. 상위 조합의 onSuccess 또는 적절한 entity 공개 API를 사용한다.
- 모든 query hook을 shared로 몰아넣지 않는다. 재사용되는 자원 조회와 화면 전용 조합을 구분한다.

## 7. Query key와 세션 격리

key는 데이터 결과를 바꾸는 입력을 식별한다. 데이터 출처·사용자와 자원별 파라미터를 포함하고, 실행 중 세션 전환을 도입하면 generation 등 격리 정책을 함께 정한다. [공식 Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)의 원칙을 적용한다.

예시:

```js
const scope = ['api', source, userId]; // 실시간 세션 전환 도입 시 generation 등 추가 검토

const monthlyKey = [...scope, 'dreams', 'monthly', yearMonth];
const detailKey = [...scope, 'dreams', 'detail', dreamId];
const statisticsKey = [...scope, 'statistics', yearMonth];
const roomKey = [...scope, 'rooms', 'detail', roomId];
```

- 위 scope는 논의를 위한 예시다. 구현 시 key factory와 자원별 무효화 prefix를 함께 확정한다.
- userId, 숫자 ID, 연월, query filter의 타입을 일관되게 정규화한다. 객체 key에 함수·클라이언트·token을 넣지 않는다.
- 광장 상세는 현재 사용자에 따라 댓글 소유·좋아요 정보가 달라지므로 사용자 scope를 생략하지 않는다.
- 같은 자원의 일반 query와 infinite query는 별도 key를 사용한다. infinite query의 cursor는 pageParam으로 전달하고 필터·size는 key에 포함한다.
- 로그아웃·사용자 변경 시 해당 캐시를 정리한다. 실시간 모드 전환·reset 도구를 추가하면 요청 취소와 generation 등 격리 정책을 함께 구현한다.

### 7.1 실시간 출처 전환을 도입하는 경우의 후속 설계

현재는 자동 fallback이나 실행 중 출처 전환이 없다. 아래 항목은 해당 기능을 별도 도입할 때 적용할 제안이며 현재 Query 도입의 선행 조건이 아니다.

요청 시작 시 live key였는데 내부 fallback이 mock 데이터를 반환하면, mock 결과가 live key 아래에 캐시될 수 있다. key에 source를 넣는 것만으로 충분하지 않다.

1. 전환 시 이전 source의 진행 중 query를 cancel한다.
2. API runtime의 generation 변경을 앱에 반영한다.
3. queryFn 완료 전에 시작 scope와 현재 scope가 같은지 확인한다. 다르면 이전 key에 성공 데이터를 저장하지 않고 취소/폐기한다.
4. 새 scope로 재조회하여 mock key에 mock 결과를 저장한다.
5. 이미 전송한 실제 mutation 결과도 새 mock 캐시에 적용하지 않는다. HTTP 취소가 서버 쓰기 취소를 보장하지는 않는다.

## 8. Mutation과 최소 무효화

2단계부터 다음 정합성을 확보한다. 구체적인 key prefix는 key 설계와 함께 확정하며, 아래 표는 영향 자원을 기록한 것이다.

| 변경 | 무효화·정리할 조회 |
| --- | --- |
| 꿈 작성·임시 저장 | 사용자 꿈 목록·총건수. 통계는 임시 저장 포함 여부를 구분 |
| 꿈 편집·날짜 변경 | 해당 상세, 이전·새 월의 목록, 관련 통계 |
| 꿈 공유 변경 | 꿈 상세·광장 목록·광장 상세 |
| 꿈 삭제 | 상세 캐시 제거, 꿈 목록·광장·관련 댓글·통계 재조회 |
| 댓글 작성·삭제·좋아요 | 해당 광장 상세 또는 댓글 query |
| 닉네임 변경 | 사용자 정보·닉네임을 포함하는 댓글·화면 데이터 |
| 방 생성·삭제 | 방 목록, 삭제한 방 상세 제거·현재 화면 처리 |
| 로그아웃·계정 변경 | 사용자에 종속된 진행 중 query 취소·캐시 제거 |

최초에는 서버 성공 후 invalidate하고 재조회하는 방식으로 시작한다. 서버가 ID나 상세 데이터를 반환하지 않는 명령은 임의의 setQueryData 성공 모델을 만들지 않는다. UI에서 서버 응답을 기다리지 않는 낙관적 갱신은 rollback과 동시 변경 설계 후 별도 도입한다.

invalidate 범위는 해당 상위 조합에서 관리한다. 모든 API 메서드에 QueryClient를 주입하여 하위 통신 코드가 캐시를 직접 수정하게 하지 않는다.

## 9. 3단계: 데이터별 캐싱 전략 초안

아래는 조정 후보이며 아직 구현값으로 확정하지 않는다. 변경 빈도·재조회 비용·mutation 이후 일관성을 확인한 뒤 적용한다.

| 자원 | staleTime 후보 | 초기 검토 포인트 |
| --- | --- | --- |
| 현재 사용자 | 1~5분 | 닉네임·권한·계정 변경 시 즉시 무효화, token은 캐시하지 않음 |
| 월별 꿈·꿈 상세 | 30초~1분 | 작성/편집 직후 무효화, 화면 재방문의 중복 요청 감소 |
| 광장 목록·상세·댓글 | 0~15초 | 다른 사용자 변경, 무한 스크롤 중 재조회 비용 |
| 월별 통계 | 1~5분 | 꿈 변경 후 무효화, 과거 월도 수정될 수 있음 |
| 방 목록·상세 | 0~15초 | 참가자 수·방 삭제 등 소켓 연계와 조회 역할 구분 |
| 이미지·해몽 생성 | query 캐시 미적용 | 사용자 요청 mutation, 자동 retry 없음 |

- gcTime은 우선 5분으로 두고 필요할 때 자원별로 조정한다. staleTime과 같은 값으로 기계적으로 맞추지 않는다.
- focus/reconnect 재조회는 실시간성 요구와 입력 중단 여부를 확인한다. 모든 자원에서 일괄 끄지 않는다.
- polling과 socket 업데이트를 동시에 사용해 동일 데이터가 경쟁하지 않게 한다. 참가자 수를 socket이 제공하면 query와의 역할을 명확히 한다.
- 별도 요구가 없으면 브라우저 저장소의 영속 캐시, background persistence, prefetch, SSR hydration은 도입하지 않는다.
- mock-store는 가상 서버 저장소다. Query 캐시를 비워도 mock 데이터 자체가 초기화되어서는 안 된다. 향후 mock reset 도구를 추가하면 query 캐시도 초기화하거나 새로운 scope로 갱신한다.

## 10. 오류·재시도·로딩·취소

- 2단계 초기 retry=0을 유지하고, 3단계에서 멱등 조회에 한해 네트워크·일시적 5xx의 제한적 재시도를 검토한다.
- 401/403, validation, 계약 오류, 사용자 취소는 반복 요청하지 않는다. 현재 자동 fallback은 없으며, 향후 추가하는 재시도 계층과 Query retry가 중첩되지 않도록 한다.
- 최초 로딩과 배경 재조회 UI를 구분한다. 재조회 때문에 기존 데이터 전체를 지우거나 폼을 초기화하지 않는다.
- 캐시된 꿈 상세가 갱신돼도 사용자가 편집 중인 입력을 자동으로 덮어쓰지 않는다. 서버 초기값과 폼 수정 상태를 구분한다.
- API 함수에 전달한 signal을 실제로 소비한다. mock 지연 처리도 취소 가능해야 한다. [공식 Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)을 기준으로 검증한다.
- 공통 오류 표시와 페이지 오류 UI가 같은 실패에 중복 toast를 표시하지 않도록 책임을 정한다.

## 11. 검증과 완료 기준

### 2단계

- 선행 단계의 API 함수와 mock dataset을 수정하지 않고 Query에서 호출할 수 있다.
- 새 Provider가 안정된 QueryClient 인스턴스를 사용하며 FSD 계층·공개 API 규칙을 위반하지 않는다.
- 동일 key 조회를 여러 컴포넌트가 사용해도 의도한 캐시·로딩 상태를 공유한다.
- 사용자·월·ID 변경 및 live/mock 전환 시 이전 데이터가 잘못 표시되거나 캐시되지 않는다.
- 화면 이동·AbortSignal 취소를 일반 오류로 표시하거나 자동 재시도하지 않는다.
- 작성/수정/삭제·댓글·닉네임·방 관리 후 표의 관련 조회가 갱신된다.
- 조회 결과를 Query와 Recoil/local state에 중복 보관하지 않으며, 편집 입력은 배경 재조회로 유실되지 않는다.
- runtime 오류·접근 경로·mock CRUD·빌드·구조 검사를 재검증한다.

### 3단계

- staleTime/gcTime과 focus/reconnect를 fake timer·정해진 시나리오로 검증한다.
- staleTime 경과만으로 polling되는 것으로 잘못 기대하지 않는다. 실제 mount/focus/reconnect/명시적 invalidation 조건을 검사한다.
- 과도한 invalidate·중복 네트워크 요청을 확인하고 자원별 정책을 문서화한다.
- 로그아웃·계정 전환·mock reset 이후 개인 데이터가 이전 캐시로 남지 않는다.
- mutation timeout과 AI 생성이 자동 반복되지 않는다.
- 필요할 때만 pagination/socket 연계를 검증하고, 영속 캐시·낙관적 갱신은 별도 완료 조건을 둔다.

## 12. 권장 커밋과 브랜치 흐름

API 작업은 `feat/frontend-api-management`에서 시작했으며 API 중앙화와 개발 목을 연결한 상태다. 브라우저·실제 서버 검증과 후속 범위는 선행 계획의 현재 상태를 따른다. Query 구현은 이 작업을 refactor에 병합한 이후 별도의 기능 브랜치에서 시작한다.

후속 Query 단계의 커밋 예시:

1. `feat: TanStack Query 공통 Provider와 기본 정책 추가`
2. `refactor: 월별 꿈과 상세 조회를 Query로 이관`
3. `feat: 꿈 변경 후 관련 조회 무효화 연결`
4. `refactor: 광장과 댓글 조회 상태를 Query로 이관`
5. `refactor: 통계와 방 및 사용자 조회 상태 이관`
6. `feat: 세션과 mock 전환 시 Query 캐시 격리`
7. `test: Query 수명과 변경 후 동기화 검증`
8. `docs: 자원별 캐시와 재조회 정책 기록`

세션 격리는 첫 Query 자원부터 적용한다. 위 커밋 예시의 후반 항목은 전체 화면으로의 확장·검증을 뜻하며, 중간 단계에서 사용자 캐시가 섞이는 상태를 허용하지 않는다. 각 단위는 해당 기능이 동작하는 상태로 완료한다.

## 13. 향후 결정할 사항

- 설치할 TanStack Query 버전과 개발용 Devtools 도입 여부.
- 자원별 query key factory의 최종 위치·공개 API.
- 공통 도메인 모델이 실제로 필요한 자원과 DTO를 그대로 사용할 자원.
- 3단계 자원별 캐시 시간 및 focus/reconnect 정책.
- 소켓과 Query가 같은 필드를 갱신할 때의 단일 기준.
- 영속 캐시·낙관적 갱신·prefetch의 실제 필요성.

이 선택들은 후속 구현 시 확정한다. API 중앙화 단계에서 미리 라이브러리를 설치하거나 상세 캐시 정책을 강제하지 않는다.

## 14. 참고 문서

- [현재 API 중앙 관리와 mock 계획](./frontend-api-mock-plan.md)
- [TanStack Query 기본 캐시 동작](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query key](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Query 취소와 Axios signal](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)

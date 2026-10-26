# 홈 화면 및 내비게이션 변경사항

작성일: 2026-10-26

## 비교 기준

현재 `HEAD`와 작업 디렉터리의 diff를 기준으로 작성했다. Git에 아직 추가되지 않은 `useHomeDreams.js`, `HomeGreeting.jsx`, `HomeDreamSection.jsx`, `YearSelector.jsx`도 직접 확인해 포함했다. 이 대화 이전부터 작업 디렉터리에 존재했던 홈 화면 변경도 포함한다.

각 항목은 최종 구현을 기준으로 설명한다. 로딩 표시의 중간 구현인 점 세 개와 `animate-pulse`는 최종 상태에서 원형 스피너로 대체됐다.

## 1. 홈 화면 높이와 스크롤 구조

대상: `frontend/src/pages/home/ui/HomePage.jsx`, `HomeGreeting.jsx`, `HomeDreamSection.jsx`

- **기존 상태:** 홈 전체에 `h-dvh`, 인사 영역에 고정 높이 `700px`, 목록 영역에 비율 높이를 사용했다. 목록으로 이동하는 스크롤 버튼과 화면 노출 여부를 추적하는 `IntersectionObserver`가 있었다.
- **개선 방안:** 주어진 화면 높이 안에 인사와 기록 영역을 배치하고, 목록 영역에서 스크롤하도록 구조를 단순화한다.
- **해결 후 상태:** `h-full`과 `grid-rows-[minmax(0,3fr)_minmax(0,7fr)]`로 인사와 기록 영역을 3:7로 배치한다. 기록 영역의 헤더와 월 선택은 유지되고, 목록 컨테이너에 `overflow-y-auto`와 `overscroll-y-contain`을 적용했다. 인사 영역은 별도 컴포넌트로 분리하고 긴 닉네임의 줄바꿈을 허용했다.

## 2. 홈 데이터 조회 로직 분리와 요청 취소

대상: `frontend/src/pages/home/ui/HomePage.jsx`, `frontend/src/pages/home/model/useHomeDreams.js`

- **기존 상태:** `HomePage`가 사용자 조회, 월별 꿈 조회, Recoil 갱신, 오류 이동까지 처리했다. 연도·월 변경으로 이전 요청이 뒤늦게 완료되는 상황을 차단하는 처리가 없었다.
- **개선 방안:** 조회 로직을 훅으로 분리하고 로딩 상태 및 이전 요청의 정리를 관리한다.
- **해결 후 상태:** `useHomeDreams(year, month)`가 `dreams`, `user`, `totalCount`, `isLoading`을 반환한다. Effect 정리 시 `AbortController.abort()`를 호출하며, 취소된 요청은 상태 갱신과 오류 페이지 이동을 수행하지 않는다. 취소되지 않은 오류는 기존처럼 401이면 로그인, 그 외에는 오류 페이지로 이동한다.

## 3. 연도 선택 UI 분리 및 호버 스타일

대상: `frontend/src/pages/home/ui/YearSelector.jsx`, `MonthSelector.jsx`, `HomeDreamSection.jsx`

- **기존 상태:** `MonthSelector` 안에서 문자 `<`, `>` 버튼으로 연도를 변경했다. 별도의 `YearSelector`가 없었다. 이번 대화에서 확인한 분리 직후 구현에는 이미 일반 `hover` 스타일이 적용돼 있었다.
- **개선 방안:** 연도와 월 선택의 책임을 나누고, 호버 가능한 환경에서만 버튼 배경색을 표시한다.
- **해결 후 상태:** `YearSelector`에서 `IoChevronBack`, `IoChevronForward`를 사용한다. 버튼은 `40×40px`이며 접근성 이름과 키보드 포커스 표시를 제공한다. 1900년 이하에서는 이전 연도 버튼을 비활성화한다. `[@media(hover:hover)]` 조건으로 호버 배경색과 글자색을 적용해 터치 환경에서 탭 후 호버 스타일이 남는 상황을 방지한다. 연도 변경은 계속 클릭으로 수행한다.

## 4. 월 선택 컴포넌트 정리

대상: `frontend/src/pages/home/ui/MonthSelector.jsx`

- **기존 상태:** 연도 변경과 월 선택을 함께 처리했고, Swiper 이동 Effect가 중복돼 있었다. 클릭 가능한 슬라이드 내부에 일반 텍스트로 월을 표시했다. 사용하지 않는 Pagination 모듈과 관련 CSS도 불러왔다.
- **개선 방안:** 월 선택에 집중하고 Swiper 상태 동기화 및 버튼 의미를 명확하게 한다.
- **해결 후 상태:** `month`, `setMonth`만 전달받는다. `initialSlide`로 초기 월을 지정하고 `onSwiper`로 인스턴스를 저장하며, 월 변경 Effect 하나로 위치를 동기화한다. 각 월은 실제 `button`이며 `aria-pressed`로 선택 상태를 전달한다. 선택한 월의 배경색은 유지하고 불필요한 모듈·CSS import는 제거했다.

## 5. 꿈 목록 구조 및 상세 페이지 이동

대상: `frontend/src/pages/home/ui/DreamList.jsx`

- **기존 상태:** 중첩된 `div`와 비율 너비로 날짜·내용을 배치했다. 클릭 이벤트에서 상단 스크롤 함수를 실행한 다음 `navigate`로 이동했다. 요일은 선택 중인 연도·월과 기록의 일자를 조합해 계산했다.
- **개선 방안:** 목록과 링크의 의미를 HTML에 표현하고, 날짜 및 긴 내용의 배치를 안정적으로 처리한다.
- **해결 후 상태:** `ul`/`li`, `time`, `Link`를 사용한다. 날짜 열은 48px, 내용 열은 `minmax(0,1fr)`로 배치하며 긴 내용은 말줄임 처리한다. 요일은 기록 자체의 `writeTime` 전체 날짜를 기준으로 계산한다. 이미지가 있는 항목은 중앙 배경 이미지와 어두운 오버레이를, 없는 항목은 기본 보라색 배경을 사용한다. 목록·링크에 접근성 이름을 추가했고, 상세 이동 시 별도 상단 스크롤 호출은 제거했다.

## 6. 목록 로딩 상태와 빈 상태 구분

대상: `frontend/src/pages/home/ui/DreamList.jsx`, `frontend/src/pages/home/model/useHomeDreams.js`

- **기존 상태:** `HEAD`의 목록은 로딩 상태를 받지 않아 조회 중에도 빈 목록 안내를 표시할 수 있었다. 이후 작업 중 추가된 로딩 문구는 “꿈 기록을 불러오고 있습니다.”였다.
- **개선 방안:** 로딩과 조회 결과 없음 상태를 구분하고, 로딩 중에는 회전 애니메이션으로 진행 상태를 표현한다.
- **해결 후 상태:** `isLoading`이 참이면 20×20px 원형 스피너를 표시한다. `border-2`, `border-t-primary-500`, `rounded-full`로 형태를 만들고 `motion-safe:animate-spin`으로 회전시킨다. 애니메이션 감소 설정에서는 회전하지 않는다. 안내 문구는 `sr-only`로 유지하고 상태 영역에 `role="status"`를 지정했다. 로딩이 끝난 뒤 기록이 없으면 기존의 “작성된 일기가 없습니다. 꿈을 기록해보세요.” 안내를 표시한다.

## 7. 통계 이동 링크와 기록 영역 구조

대상: `frontend/src/pages/home/ui/HomeDreamSection.jsx`

- **기존 상태:** 통계 아이콘을 클릭 가능한 `div`로 감싸고 `navigate`를 호출했다. 기록 영역의 구성 요소가 `HomePage`에 직접 들어 있었다.
- **개선 방안:** 기록 영역을 별도 컴포넌트로 구성하고 통계 이동에 링크 의미와 접근성 이름을 제공한다.
- **해결 후 상태:** `HomeDreamSection`이 연도 선택, 월 선택, 목록을 조합한다. 통계 이동은 `/statistics`를 가리키는 `Link`로 변경했다. 영역 제목은 `sr-only`로 제공하고 목록 스크롤 영역에 “꿈 목록” 이름을 지정했다.

## 8. 하단 내비게이션 아이콘 및 가운데 요소 크기

대상: `frontend/src/app/ui/NavigationBar.jsx`

- **기존 상태:** Music은 `FaMusic`, 기본 작성 버튼은 55px 크기의 사용자 정의 `CreateNavigationItem` SVG였다. 기본 작성 링크와 녹음 버튼이 서로 다른 렌더링 분기에 있었으며, 가운데 부모 높이가 명시적으로 고정돼 있지 않았다.
- **개선 방안:** 요청한 아이콘으로 교체하고 기본 아이콘 크기를 일반 메뉴와 맞춘다. 작성·녹음 전환 시 차지하는 공간은 공통 부모에서 고정한다.
- **해결 후 상태:** Music을 `IoMusicalNotes`, 기본 작성 아이콘을 `FaPlusCircle`로 변경했다. 기본 작성 아이콘은 일반 메뉴와 같은 28px이며 색상은 `#737DFE`다. 가운데 공통 부모는 `55×55px`와 `shrink-0`를 사용한다. 기본 작성 링크는 부모 전체를 차지하며, `/dream/`으로 시작하는 경로에서는 기존 `SpeechInputButton`을 표시한다. 녹음 SVG와 녹음 상태 처리는 유지한다. 기본 아이콘의 시각적 크기와 가운데 요소가 확보하는 공간은 각각 28px, 55px로 구분된다.

## 9. 사용하지 않는 스크롤 버튼 및 CSS 제거

대상: `frontend/src/pages/home/ui/ScrollDownButton.jsx`, `frontend/src/app/styles/global.css`, `HomePage.jsx`

- **기존 상태:** 목록으로 이동하는 `ScrollDownButton`과 `.scroll-loader`, `scrollDown` 키프레임이 있었다. 버튼 표시 및 스크롤 이동을 위한 ref와 Effect도 필요했다.
- **개선 방안:** 화면 안에서 기록 영역을 바로 제공하는 구조에 맞춰 불필요해진 스크롤 유도 코드를 제거한다.
- **해결 후 상태:** `ScrollDownButton.jsx`를 삭제하고 관련 CSS 44줄을 제거했다. `HomePage`의 `IntersectionObserver`, 스크롤 함수, 관련 ref와 상태도 제거했다.

## 확인 범위와 검증 기록

- 최초 문서 작성 시 추적 중인 파일 6개의 diff와 신규 파일 4개의 내용을 확인했다. 후속 검토에서 아이콘 교체 후 사용처가 없어진 `CreateNavigationItem.jsx`도 삭제했다.
- 이번 대화에서 `NavigationBar.jsx`의 ESLint 검사는 통과했다.
- `DreamList.jsx`는 기존 `react/prop-types` 규칙을 끈 개별 ESLint 검사에서 통과했다.
- 후속 검토에서 홈 디렉터리와 `NavigationBar.jsx`의 ESLint를 실행했다. props 검증 누락 18건과 Swiper 경로 해석 오류 2건으로 전체 검사는 통과하지 못했다. 기존 홈 컴포넌트에도 동일한 종류의 문제가 있으며, 신규 분리 컴포넌트에도 props 검증이 없는 상태다.
- 후속 검토에서 `npm run build`가 통과했다. 기존 CSS의 `// STTWaveBar` 주석에 따른 문법 경고, Sass 사용 중단 경고와 오래된 Browserslist 데이터 경고는 남아 있다.
- 브라우저 화면, 실제 API 및 녹음 동작은 검증하지 않았다.
- 기존 `docs/frontend-navigation-work.md`는 이전 작업 시점의 기록이다. 이번 내비게이션 변경의 최종 상태는 이 문서의 8번 항목을 기준으로 확인한다.

# NavigationBar 디자인 및 코드 정리

작성일: 2026-10-26

## 작업 목적

하단 내비게이션을 채워진 아이콘으로 통일하고, 현재 페이지에 해당하는 메뉴를 그라데이션으로 표시한다. 파일을 추가로 세분화하거나 별도 훅·범용 메뉴 시스템을 도입하지 않고 중복 렌더링을 정리했다.

## 아이콘과 스타일

`react-icons` 의존성을 추가했다. 최종 아이콘 구성은 다음과 같다.

| 메뉴 | 이동 경로 | 아이콘 |
| --- | --- | --- |
| HOME | `/` | `IoHome` (`react-icons/io5`) |
| SQUARE | `/square/dreams` | `IoGrid` (`react-icons/io5`) |
| 꿈 기록 | `/dream/create` | 기존 원형 더하기 SVG |
| MUSIC | `/streaming` | `FaMusic` (`react-icons/fa6`) |
| SETTINGS | `/settings` | `FaGear` (`react-icons/fa6`) |

- 일반 메뉴 아이콘 크기는 28px, 라벨 크기는 11px이다.
- 활성 아이콘은 위쪽 `#7C81F2`에서 아래쪽 `#E9C3CE`로 이어지는 그라데이션으로 채운다. 비활성 아이콘은 검정색이다.
- CSS 배경 대신 SVG `linearGradient`를 정의하고 아이콘의 `fill`에서 참조한다. React `useId`로 그라데이션 ID를 구분한다.
- 홈은 `/`에서만 활성화한다. Square는 `/square` 하위 페이지, Music은 `/streaming` 하위 페이지에서도 활성화한다.
- 활성 링크에 `aria-current="page"`를 설정하고 장식용 SVG는 보조 기술에서 숨긴다.

## 중앙 작성·녹음 버튼

- 일반 페이지에서는 꿈 기록 페이지로 이동하는 링크를 표시한다.
- `/dream/`으로 시작하는 작성·편집 경로에서는 링크 대신 음성 녹음 버튼을 표시한다.
- 작성·녹음 SVG의 `absolute`와 좌표 지정을 제거하고 다른 메뉴와 함께 Flex로 중앙 정렬했다. 중앙 항목은 너비 55px을 사용한다.
- 하단 내비게이션 바 자체의 `fixed` 배치는 유지한다.
- 녹음 SVG를 실제 `button`으로 감싸 키보드로 실행할 수 있도록 하고 접근성 이름을 추가했다. 기존 녹음 상태와 마이크 색상 전환은 유지한다.

## 컴포넌트와 렌더링 정리

- `NavigationItem.jsx`에 아이콘·라벨의 공통 레이아웃을 추출했다. `label`은 props, 아이콘은 children으로 전달한다.
- 아이콘과 라벨만 감싸던 `HomeNavigationItem`, `SquareNavigationItem`, `StreamingNavigationItem`, `SettingsNavigationItem`은 제거했다.
- `NavigationBar.jsx`의 `items`는 경로, 활성 경로, 라벨, 아이콘 컴포넌트, 중앙 항목 여부만 선언한다. 공통 JSX는 `map`에서 한 번 작성한다.
- 중앙 항목은 `isCreate`로 구분하고 녹음 페이지 여부는 반복문 밖에서 계산한다.
- 불필요한 `async`, 사용되지 않는 `color` 전달, 중복 설명 주석을 제거했다.
- 작성 버튼과 음성 녹음 버튼은 기존 컴포넌트를 사용한다. 추가적인 파일 분리나 별도 훅은 도입하지 않았다.

## 변경 파일

- `frontend/package.json`, `frontend/package-lock.json`: React Icons 추가
- `frontend/src/app/ui/NavigationBar.jsx`: 메뉴 데이터, 활성 상태, 그라데이션, 렌더링 정리
- `frontend/src/app/ui/NavigationItem.jsx`: 공통 레이아웃 추가
- `frontend/src/app/ui/CreateNavigationItem.jsx`: 위치 지정 제거
- `frontend/src/features/dream-editor/ui/SpeechInputButton.jsx`: 위치 지정 제거 및 버튼 요소 적용
- 기존 개별 일반 메뉴 컴포넌트 4개 삭제

## 검증

- `frontend`에서 `npm run build` 성공
- `git diff --check` 통과
- 기존 CSS 문법 및 Sass 사용 중단 경고는 남아 있다.
- 브라우저 시각 검증과 실제 음성인식 동작 검증은 수행하지 않았다. 빌드 성공은 해당 동작의 실행 검증을 의미하지 않는다.

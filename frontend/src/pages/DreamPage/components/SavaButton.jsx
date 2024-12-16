// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue, useRecoilCallback } from 'recoil';
// import { baseURLState, isListeningState, userState, contentState } from '../../recoil/atoms';
import { contentState } from '../../../recoil/atoms';
import { useCallback } from 'react';

const SaveButton = () => {
  //   const content = useRecoilValue(contentState);
  const saveDream = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const content = await snapshot.getPromise(contentState);
        console.log(content);
        // 비즈니스 로직 추가...
      },
    [],
  ); // 의존성 배열에 필요한 상태를 추가

  return (
    <div className="flex justify-center">
      <button onClick={saveDream} className="my-5 h-10 w-32 rounded-full border bg-primary-500 font-bold">
        저장하기
      </button>
    </div>
  );
};

export default SaveButton;

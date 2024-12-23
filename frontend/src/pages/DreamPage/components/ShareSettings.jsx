// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

import { useState, useEffect } from 'react';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilCallback } from 'recoil';
import { interpState, imageState, isSharedState } from '../../../recoil/dream/atom';

// 앱 내부의 컴포넌트/아이콘
const ShareSettings = ({ initial }) => {
  const [isShared, setIsShared] = useState(isSharedState);

  useEffect(() => {
    setIsShared(initial);
  });
  const toggle = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const image = snapshot.getPromise(imageState);
        const interpretation = snapshot.getPromise(interpState);
        if (image == null || interpretation == null) {
          Swal.fire({
            icon: 'warning',
            text: '꿈을 공유하기 위해서는 해몽과 그림이 필요해요',
          });
          return;
        }
        setIsShared(!isShared);
      },
    [],
  );

  return (
    <div className="mx-2 flex justify-between">
      <div>꿈 공유하기</div>
      <div className="flex items-center">
        <div
          id="toggleButton"
          className={`relative inline-flex cursor-pointer items-center rounded-xl ${isShared ? 'bg-blue-500' : 'bg-gray-300'}`}
          onClick={toggle}
        >
          <div className="h-5 w-10 rounded-full"></div>
          <div
            className={`absolute h-6 w-6 rounded-full border-2 bg-white transition-transform ${
              isShared ? 'translate-x-5 border-blue-500' : 'border-gray-300'
            }`}
            id="toggleSwitch"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ShareSettings;

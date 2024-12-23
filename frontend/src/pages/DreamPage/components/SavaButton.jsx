// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import api from '../../../utils/api';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilCallback } from 'recoil';
import { userState } from '../../../recoil/atoms';
import { dateState, contentState, interpState, imageState, isSharedState } from '../../../recoil/dream/atom';
import Button from '../../../components/Button';

const SaveButton = ({ MIN_LENGTH }) => {
  const [isSaving, setIsSaving] = useState(false);
  const saveDream = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          // 저장중에는 추가적인 저장 불가능하도록 설정
          if (isSaving) {
            return;
          }
          const content = await snapshot.getPromise(contentState);

          if (content.replace(/ /g, '') === '') {
            Swal.fire({
              title: 'ERROR',
              icon: 'error',
              text: '공백은 저장이 불가능합니다.',
            });
            return;
          }
          console.log(content, isShared);
          if (content.length < MIN_LENGTH) {
            Swal.fire({
              text: `정확한 통계을 위해 꿈 내용을 ${MIN_LENGTH}자 이상 작성해주세요.`,
              icon: 'warning',
              confirmButtonText: '확인',
            });
            return;
          }

          const image = await snapshot.getPromise(imageState);
          const interpretation = await snapshot.getPromise(interpState);
          const userId = await snapshot.getPromise(userState).userId;
          const isShared = await snapshot.getPromise(isSharedState);
          const writeTime = await snapshot.getPromise(dateState);

          console.log(content, isShared);
          // 유효성 통과 후 저장 시작
          if (isSaving) return;
          setIsSaving(true);
          const response = await api.post(`/dream/create`, {
            content: content,
            image: image,
            interpretation: interpretation,
            userId: userId,
            isShared: isShared,
            writeTime: writeTime.replace(/-/g, ''),
          });
          navigate('/');
        } catch (error) {
          setIsSaving(false);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          } else {
            navigate('/error');
          }
        }
      },
    [],
  );

  return (
    <div className="flex justify-center">
      <Button
        onClick={() => saveDream()}
        className="my-5 h-10 w-32 rounded-full border bg-primary-500 font-bold"
        rounded="full"
      >
        {!isSaving ? '저장하기' : '저장중...'}
      </Button>
    </div>
  );
};

export default SaveButton;

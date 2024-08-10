import React from 'react';
import SkeletonBlock from '../pages/SkeletonPage/components/SkeletonBlock';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/atoms';

const StatisticsPage = () => {
  const user = useRecoilValue(userState);
  console.log(user);
  const nickname = user.nickname;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#3a3a3a]">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-start bg-[#3a3a3a] p-5">
        {/* 안내문구 */}
        <div className="flex h-16 w-full flex-col items-end justify-start gap-1 text-white">
          <p>{nickname}님의 꿈 속에서</p>
          <p>일어난 일을 분석해봤어요</p>
        </div>
        <div>월별 통계 선택 picker</div>
        {/* 사물 */}
        <div className="flex h-64 w-full flex-col items-center justify-center gap-2.5 rounded-3xl bg-[black] p-6 opacity-30">
          <p className="text-white">이번달에 가장 많았던 키워드는 object(이)네요</p>
          {/* 1위 | 가족 | #태그1 #태그2 #태그3 */}
        </div>
        <div className="flex w-full flex-grow flex-col items-center justify-end gap-2.5 bg-[#3a3a3a] py-6">
          <div className="flex w-full items-center justify-start gap-5 p-2.5">
            <div className="h-40 w-40 rounded-3xl bg-[#E3DEFF]">
              <p>character와(과) 함께했네요!</p>
              {/* 1위 | 친구 */}
            </div>
            <div className="h-40 w-40 rounded-3xl bg-[#36258D]">
              <p className="text-white">location을(를) 자주 갔군요!</p>
              {/* 1위 | 교실 */}
            </div>
          </div>
          <div className="flex h-48 w-full flex-col items-center justify-center gap-2.5 rounded-3xl bg-[white] p-6">
            <div className="flex w-full items-center justify-center gap-4 px-12">
              <p>***, *** 감정이 가장 많았어요</p>
              {/* 기분 10개 받아와서 태그로 담기 */}
            </div>
          </div>
          <div className="mt-4 flex h-56 w-full items-end justify-center gap-4 rounded-3xl bg-[white] p-2.5">
            <p>이번달에 꾼 꿈 종류예요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

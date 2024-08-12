import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { baseURLState, userState } from '../recoil/atoms';
import axios from 'axios';

const StatisticsPage = () => {
  const user = useRecoilValue(userState);
  const baseURL = useRecoilValue(baseURLState);

  const nickname = user.nickname;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [currentDate, setCurrentDate] = useState(`${currentYear}${String(currentMonth).padStart(2, '0')}`);

  const [objects, setObjects] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [moods, setMoods] = useState([]);
  const [dreamTypeCounts, setDreamTypeCounts] = useState([]);
  useEffect(() => {
    fetchStatistics();
  }, [currentDate]);

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    if (selectedYear > currentYear || (selectedYear === currentYear && month > currentMonth)) {
      setMonth(currentMonth);
    }
    setYear(selectedYear);
    setCurrentDate(`${selectedYear}${String(month).padStart(2, '0')}`);
  };

  const handleMonthChange = (e) => {
    const selectedMonth = parseInt(e.target.value, 10);
    setMonth(selectedMonth);
    setCurrentDate(`${year}${String(selectedMonth).padStart(2, '0')}`);
  };

  const fetchStatistics = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`${baseURL}/statistics/${user.userId}/${currentDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const statistics = response.data.data;
      console.log(statistics);
      setObjects(statistics.objects || []);
      setCharacters(statistics.characters || []);
      setLocations(statistics.locations || []);
      setMoods(statistics.moods || []);
      setDreamTypeCounts(statistics.dreamTypeCounts || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // handleError(); // 에러 핸들링
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#3a3a3a]">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-start bg-[#3a3a3a] p-5">
        {/* 안내 문구 */}
        <div className="flex h-16 w-full flex-col items-end justify-start gap-1 text-lg text-white">
          <p>{nickname}님의 꿈 속에서</p>
          <p>일어난 일을 분석해봤어요</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <select
              value={year}
              onChange={handleYearChange}
              className="rounded-md border border-[#3a3a3a] bg-[#3a3a3a] p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const optionYear = currentYear - 5 + i;
                return (
                  <option key={i} value={optionYear} disabled={optionYear > currentYear}>
                    {optionYear}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="flex items-center space-x-2">
            <select
              value={month}
              onChange={handleMonthChange}
              className="rounded-md border border-[#3a3a3a] bg-[#3a3a3a] p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={year === currentYear && month > currentMonth}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const optionMonth = i + 1;
                return (
                  <option key={i} value={optionMonth} disabled={year === currentYear && optionMonth > currentMonth}>
                    {String(optionMonth).padStart(2, '0')}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        {/* 사물 */}
        <div className="flex h-64 w-full flex-col justify-center gap-2.5 rounded-3xl border-black bg-[#0000007c] p-6">
          {objects.length > 0 ? (
            objects.map((object, index) => (
              <div key={index} className="">
                <div className="bg-tag-gradient h-full w-full rounded-3xl border-black p-4">
                  <div className="flex">
                    <p>{index + 1}위 </p>
                    <p className="px-2 font-bold">{object.word}</p>
                  </div>
                  <p className="text-sm font-bold text-[#9CA1E1]">{object.hashTags.join(' ')}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">이번달에 분석된 키워드가 없습니다.</p>
          )}
        </div>
        <div className="flex w-full flex-grow flex-col items-center justify-end gap-2.5 bg-[#3a3a3a] py-6">
          <div className="flex w-full items-center justify-start gap-5 p-2.5">
            {/* 인물 */}
            <div className="h-40 w-40 rounded-3xl bg-[#E3DEFF]">
              <p className="mb-4 mt-7 text-center">누가 자주 나왔을까요?</p>
              {characters.length > 0 ? (
                characters.map((character, index) => (
                  <div key={index} className="text-center text-black">
                    <div className="flex justify-center align-middle">
                      <p>{index + 1}위</p>
                      <p className="px-2 font-bold">{character.word}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-bold mt-3 items-center text-center text-gray-500">
                  이번달에 분석된 <br />
                  키워드가 없습니다.
                </p>
              )}
            </div>
            {/* 장소 */}
            <div className="h-40 w-40 rounded-3xl bg-[#36258D] text-center">
              <p className="mb-4 mt-7 text-white">자주 간 장소예요!</p>
              {locations.length > 0 ? (
                locations.map((location, index) => (
                  <div key={index} className="text-white">
                    <div className="flex justify-center align-middle">
                      <p className="text-center">{index + 1}위</p>
                      <p className="px-2 font-bold">{location.word}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-bold mt-3 items-center text-center text-gray-500">
                  이번달에 분석된 <br />
                  키워드가 없습니다.
                </p>
              )}
            </div>
          </div>
          {/* 기분 */}
          <div className="flex h-48 w-full items-center justify-center gap-2.5 rounded-3xl bg-[white] p-6">
            <div className="flex gap-4 px-12">
              {moods.length > 0 ? (
                moods.map((mood, index) => (
                  <div key={index} className="bg-tag-gradient mx-1 my-3 flex flex-wrap rounded-3xl px-4 py-2 shadow-md">
                    <div className="flex w-full justify-center align-middle">{mood.word}</div>
                  </div>
                ))
              ) : (
                <p className="text-bold mt-3 items-center text-center text-gray-500">
                  이번달에 분석된 <br />
                  키워드가 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex h-56 w-full items-end justify-center gap-4 rounded-3xl bg-[white] p-2.5">
            {/* <p>이번달에 꾼 꿈 종류예요</p> */}
            {dreamTypeCounts.length > 0 ? (
              dreamTypeCounts.map((dreamTypeCount, index) => (
                <div key={index} className="text-white">
                  <div className="">
                    <p className="font-bold">{dreamTypeCount.dreamType}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-bold mt-3 items-center text-center text-gray-500">
                이번달에 분석된 <br />
                키워드가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsIcon } from '../assets/icons';
import axios from 'axios';
import { baseURLState } from '../recoil/atoms';
import { userState } from '../recoil/atoms';
import { useRecoilValue } from 'recoil';

// Import Swiper React components
// npm install swiper
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination } from 'swiper/modules';

import Swal from 'sweetalert2';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const MainPage = () => {
  // dreams : 꿈리스트 / year, month : 년월 /
  const current = new Date();

  const [dreams, setDreams] = useState([]);
  const [year, setYear] = useState(current.getFullYear());
  // 달은 현재의 달에서 -1이 된 값이 전달
  const [month, setMonth] = useState(current.getMonth() + 1);
  const user = useRecoilValue(userState);
  const [totalCount, setTotalCount] = useState(0);

  // 월에 포커스를 맞추기 위해서
  const swiperRef = useRef(null);

  /** 오류 처리 함수 */
  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };
  const baseURL = useRecoilValue(baseURLState);

  /** 데이터를 가져오는 함수, 날짜 변동에 따라 계속 호출되므로 함수로 처리 */
  const getDreams = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${baseURL}/dream/${user.userId}/${year}${String(month).padStart(2, '0')}01`,
        { params: {} },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const responseData = response.data.data;
      setDreams(responseData.dreamMainResponsesList);
      setTotalCount(responseData.totalCount);
    } catch (err) {
      console.log(err);
      handleError();
      navigate('/login');
    }
  };

  // 초기 렌더링시에 처리되는 일
  // dreams, totalCount 데이터 변경하기
  useEffect(() => {
    getDreams();
    swiperRef.current?.swiper.slideTo(month - 1, 0);
    // 2. 날짜에 맞게 포커스
    // month는 7월, silde index는 (7-1)월이므로 알맞게 수정
  }, []);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideTo(month - 1, 0);
    }
  }, [month]);

  // 날짜 변동에 따라 데이터 새로 호출
  const handleYear = (number) => {
    setYear((prev) => prev + number);
  };

  const handleMonth = (number) => {
    setMonth(number + 1);
  };

  // 요일을 나타내기 위한 함수
  const getWeekDay = (dateStr) => {
    const date = new Date(year, month - 1, parseInt(dateStr.slice(6, 8)));
    const option = { weekday: 'long' };
    return date.toLocaleDateString('en-US', option).slice(0, 3).toUpperCase();
  };

  useEffect(() => {
    getDreams();
  }, [year, month]);

  // 상세페이지 이동을 위한 navigate
  const navigate = useNavigate();
  const handleClick = (dreamId) => {
    navigate(`/dream/${dreamId}`);
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };
  return (
    <div className="relative h-dvh">
      <div className="absolute right-4 top-3" onClick={() => navigateToStatistics()}>
        {StatisticsIcon}
      </div>
      <header className="inline-flex h-1/4 w-full flex-col items-center justify-center gap-2.5 text-center text-white">
        {/* 닉네임 여부에 따라 다르게 표시 */}
        <p className="text-3xl font-bold">안녕하세요{user.nickname ? `, ${user.nickname}님!` : '!'}</p>
        {/* 꿈 작성 개수에 따라 다르게 표시 */}
        <p className="text-sm">
          {totalCount == 0 ? '첫번째 꿈을 기록해주세요!' : `${totalCount}번째 꿈을 기록해주세요.`}
        </p>
      </header>
      {/* 아랫부분부터 메인 내용 들어가는 페이지 */}
      <div className="mx-auto h-3/4 w-full flex-col items-center gap-2 rounded-t-3xl bg-white px-4 py-3 text-center">
        {/* 날짜 선택 */}
        <div className="h-1/5 w-full py-4 text-center">
          {/* 연도 선택 */}
          <div className="flex items-center justify-center gap-12 p-2.5 text-xl">
            <button onClick={() => handleYear(-1)}>{'<'}</button>
            <p>{year}</p>
            <button onClick={() => handleYear(1)}>{'>'}</button>
          </div>
          {/* 월 선택 */}
          <div className="align-center my-2 flex items-center justify-center gap-1 text-base">
            <Swiper
              ref={swiperRef}
              slidesPerView={6}
              centeredSlides={true}
              spaceBetween={10}
              grabCursor={true}
              modules={[Pagination]}
              slideToClickedSlide={true}
              //Swiper 컴포넌트에서 슬라이드를 클릭하면 해당 슬라이드가 중심에 오도록 설정하려면, Swiper 컴포넌트의 slideToClickedSlide 속성을 사용해야 합니다. 이 속성은 클릭한 슬라이드로 자동으로 이동하게 합니다.
              className="mySwiper h-full"
            >
              {/* 1월부터 12월까지 */}
              {Array.from({ length: 12 }).map((_, i) => (
                <SwiperSlide
                  key={i}
                  onClick={() => handleMonth(i)}
                  // className={`m-auto ${i == month ? 'rounded-lg bg-primary-500' : null}`}
                >
                  <div className="flex justify-center">
                    {/* {`${i + 1}월`}  => index번호로 월을 설정하고 있기 때문에 i == month*/}
                    <p
                      className={`m-auto p-2 ${i + 1 == month ? 'rounded-lg bg-primary-500 text-white' : 'text-slate-600'}`}
                    >
                      {`${i + 1}`}월
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 이부분에 일기 들어가기 */}
        <div className="my-2 h-3/4 flex-col overflow-y-auto">
          {dreams && dreams.length > 0 ? (
            dreams.map((dream) => {
              return (
                <div key={dream.dreamId} className="my-2 flex h-16 items-start justify-center gap-x-3">
                  <div className="mt-2 h-[60px] w-1/6 flex-col items-center justify-start">
                    <div className="text-center text-2xl font-bold">{dream.writeTime.slice(6, 8)}</div>
                    <div className="text-sm text-slate-500">{getWeekDay(dream.writeTime)}</div>
                  </div>
                  <div
                    onClick={() => handleClick(dream.dreamId)}
                    className={`flex w-3/4 shrink grow basis-0 items-start justify-between self-stretch rounded-lg bg-black bg-opacity-40 p-2.5 text-white bg-blend-darken`}
                    style={{
                      backgroundImage: dream.image ? `url(${dream.image})` : 'url(/src/assets/MainpageTest.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="m-1 truncate">{dream.content}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-col justify-center font-bold text-slate-600 md:text-lg lg:text-xl">
              <div className="mt-5">작성된 일기가 없습니다.</div>
              <div>꿈을 기록해보세요.</div>
              <div>{dreams}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;

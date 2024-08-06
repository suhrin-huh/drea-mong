import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsIcon } from '../assets/icons';
import api from '../utils/api';
import { userState } from '../recoil/atoms';
import { useRecoilValue } from 'recoil';

// Import Swiper React components
// npm install swiper
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const MainPage = () => {
  // dreams : 꿈리스트 / year, month : 년월 /
  const current = new Date();
  const [dreams, setDreams] = useState({});
  const [year, setYear] = useState(current.getFullYear());
  const [month, setMonth] = useState(current.getMonth() + 1);
  const user = useRecoilValue(userState);

  // 월에 포커스를 맞추기 위해서
  const swiperRef = useRef(null);

  // 초기 렌더링시에 처리되는 일

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`/${user.userId}/${year}${String(month).padStart(2, '0')}`);
        const response = await api.get(`/dream/${user.userId}/${year}${String(month).padStart(2, '0')}01`); // 요청을 보낼 엔드포인트
        setDreams(response.data);
        console.log(response);
        console.log(dreams);
      } catch (err) {
        console.log(`/dream/${user.userId}/${year}${String(month).padStart(2, '0')}01`);
        setError(err);
      }
    };

    fetchData();
    // 2. 날짜에 맞게 포커스
    // month는 7월, silde index는 (7-1)월이므로 알맞게 수정
    swiperRef.current?.swiper.slideTo(month - 1, 0);
  }, []);

  // 년도와 월 조절
  const handleYear = (number) => {
    setYear((prev) => prev + number);
  };

  const handleMonth = (number) => {
    setMonth(number);
  };

  // 요일을 나타내기 위한 함수
  const getWeekDay = (dateStr) => {
    const date = new Date(year, month - 1, parseInt(dateStr.slice(6, 8)));
    const option = { weekday: 'long' };
    return date.toLocaleDateString('en-US', option).slice(0, 3).toUpperCase();
  };

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
      <div className="absolute right-3 top-3" onClick={() => navigateToStatistics()}>
        {StatisticsIcon}
      </div>
      <header className="inline-flex h-1/4 w-full flex-col items-center justify-center gap-2.5 text-center text-white">
        <p className="text-2xl font-bold">안녕하세요, {dreams.username}님</p>
        <p className="text-sm">{dreams.totalCount}번째 꿈을 기록해주세요!!</p>
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
                  onClick={() => handleMonth(i + 1)}
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
          {dreams.dreams ?
            dreams.dreams.map((dream) => {
              return (
                <div className="my-2 flex h-20 items-start justify-center gap-x-3">
                  <div className="mt-2 h-[60px] w-1/6 flex-col items-center justify-start">
                    <div className="text-center text-3xl font-bold">{dream.writeDate.slice(6, 8)}</div>
                    <div className="text-slate-500">{getWeekDay(dream.writeDate)}</div>
                  </div>
                  <div
                    onClick={() => handleClick(dream.dreamId)}
                    className={`flex w-3/4 shrink grow basis-0 items-start justify-between self-stretch rounded-lg bg-black bg-opacity-40 p-2.5 text-white bg-blend-darken`}
                    style={{
                      backgroundImage: `url(${dream.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="m-1">{dream.content}</div>
                  </div>
                </div>
              );
            }): <div className={}></div>}
        </div>
      </div>
    </div>
  );
};

export default MainPage;

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsIcon, ScrollButton } from '../../assets/icons';
import axios from 'axios';
import { baseURLState, userState } from '../../recoil/atoms';
import { useRecoilValue, useRecoilState } from 'recoil';

import { useHandleError } from '../../utils/utils';

import { mainDummy } from '../../assets/dummy';
import DateSelector from './components/DateSelector';

const MainPage = () => {
  // dreams : 꿈리스트 / year, month : 년월 /
  const current = new Date();
  const [dreams, setDreams] = useState([]);
  const [year, setYear] = useState(current.getFullYear());
  // 달은 현재의 달에서 -1이 된 값이 전달
  const [month, setMonth] = useState(current.getMonth() + 1);
  const [user, setUser] = useRecoilState(userState);
  const [totalCount, setTotalCount] = useState(null);
  const baseURL = useRecoilValue(baseURLState);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem('accessToken');

  const getDreams = () => {
    // if (!accessToken) {
    //   return navigate('/login');
    // }
    axios
      .get(`${baseURL}/users/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
      .then((response) => {
        console.log('유저정보 가져왔어!', response);
        setUser(response.data.data);
        return axios.get(`${baseURL}/dream/${response.data.data.userId}/${year}${String(month).padStart(2, '0')}01`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
      })
      .then((response) => {
        const responseData = response.data.data;
        setDreams(responseData.dreamMainResponsesList);
        setTotalCount(responseData.totalCount);
        console.log(responseData);
      })
      .catch((error) => {
        setDreams(mainDummy.dreams);
        // if (error.response && error.response.status === 401) {
        //   navigate('/login');
        // } else {
        //   navigate('/error');
        // }
      });
  };

  useEffect(() => {
    getDreams();
  }, []);

  // 날짜 변동에 따라 데이터 새로 호출
  useEffect(() => {
    getDreams();
  }, [year, month]);

  // 요일을 나타내기 위한 함수
  const getWeekDay = (dateStr) => {
    const date = new Date(year, month - 1, parseInt(dateStr.slice(6, 8)));
    const option = { weekday: 'long' };
    return date.toLocaleDateString('en-US', option).slice(0, 3).toUpperCase();
  };

  const headerRef = useRef(null);
  const ScrollToHeader = () => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClick = (dreamId) => {
    ScrollToHeader();
    navigate(`/dream/${dreamId}`);
  };

  // 통계 아이콘 선택시 통계 페이지로 이동
  const navigateToStatistics = () => {
    console.log(window.scrollY);
    navigate('/statistics');
  };

  // 스크롤버튼의 화면 노출 관리
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const mainRef = useRef(null);

  // 버튼 노출 여부
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 요소가 보일 때 true, 보이지 않을 때 false로 설정
        setIsButtonVisible(entry.isIntersecting);
      },
      {
        threshold: 0.8, // 요소가 10% 이상 보이면 감지
      },
    );

    if (mainRef.current) {
      observer.observe(mainRef.current);
    }

    // 컴포넌트가 언마운트될 때 observer를 해제합니다.
    return () => {
      if (mainRef.current) {
        observer.unobserve(mainRef.current);
      }
    };
  }, []);

  const ScrollToDiv = () => {
    // 참조된 div가 있으면 그 위치로 스크롤 이동
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={headerRef} className="relative h-dvh">
      <header className="inline-flex h-[700px] w-full flex-col items-center justify-center gap-2.5 text-center text-white transition delay-150 ease-in-out">
        <p className="text-3xl font-bold">{user.nickname ? `안녕하세요, ${user.nickname}님!` : '안녕하세요!'}</p>
        <p className="text-sm">
          {totalCount ? `${totalCount + 1}번째 꿈을 기록해주세요.` : '첫번째 꿈을 기록해주세요!'}
        </p>
        {!isButtonVisible ? <ScrollButton scrollDown={() => ScrollToDiv()} /> : null}
      </header>
      {/* 아랫부분부터 메인 내용 들어가는 페이지 */}
      <div
        ref={mainRef}
        className="relative mx-auto h-3/4 w-full flex-col items-center gap-2 rounded-t-3xl bg-white px-4 py-1 text-center"
      >
        <div className="absolute right-5 top-5" onClick={() => navigateToStatistics()}>
          {StatisticsIcon}
        </div>
        <div className="h-1/5 w-full py-4 text-center">
          <div className="flex justify-center">
            <div className="mb-3 h-2 w-24 rounded-full bg-primary-500"></div>
          </div>
          <DateSelector year={year} month={month} setMonth={setMonth} setYear={setYear} />
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
                    className={`flex w-3/4 items-start justify-between rounded-lg ${dream.image ? 'bg-black bg-opacity-30' : 'bg-primary-500 bg-opacity-70'} p-2.5 text-white bg-blend-darken`}
                    style={
                      dream.image
                        ? {
                            backgroundImage: `url(${dream.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : null
                    }
                  >
                    <div className="m-3 truncate">{dream.content}</div>
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

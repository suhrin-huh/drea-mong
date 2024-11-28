import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsIcon, ScrollButton } from '../../assets/icons';
import api from '../../utils/api';
import { userState } from '../../recoil/atoms';
import { useRecoilState } from 'recoil';
import DateSelector from './components/DateSelector';
import DreamList from './components/DreamList';

import { mainDummy } from '../../assets/dummy';

const MainPage = () => {
  const current = new Date();
  const [dreams, setDreams] = useState([]);
  const [year, setYear] = useState(current.getFullYear());
  const [month, setMonth] = useState(current.getMonth() + 1);
  const [user, setUser] = useRecoilState(userState);
  const [totalCount, setTotalCount] = useState(null);
  const navigate = useNavigate();
  const getDreams = async () => {
    // if (!accessToken) {
    //   return navigate('/login');
    // }
    try {
      const userInfo = await api.get('api/users/info').data.data;
      setUser(userInfo);
      const dreamInfo = await api.get(`api/dream/${user.userId}/${year}${String(month).padStart(2, '0')}01`);
      etDreams(dreamInfo.dreamMainResponsesList);
      setTotalCount(dreamInfo.totalCount);
    } catch {
      setDreams(mainDummy.dreams);
      setTotalCount(mainDummy.totalCount);
    }
  };

  useEffect(() => {
    getDreams();
  }, [year, month]);

  const headerRef = useRef(null);
  const scrollToHeader = () => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };

  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const mainRef = useRef(null);

  // 버튼 노출 여부
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsButtonVisible(entry.isIntersecting);
      },
      {
        threshold: 0.8,
      },
    );

    if (mainRef.current) {
      observer.observe(mainRef.current);
    }

    return () => {
      if (mainRef.current) {
        observer.unobserve(mainRef.current);
      }
    };
  }, []);

  const ScrollToDiv = () => {
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
        <DreamList year={year} month={month} dreams={dreams} scrollToHeader={scrollToHeader} />
      </div>
    </div>
  );
};

export default MainPage;

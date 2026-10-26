import { useState } from 'react';
import useHomeDreams from '../model/useHomeDreams';
import HomeGreeting from './HomeGreeting';
import HomeDreamSection from './HomeDreamSection';

const HomePage = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const { dreams, user, totalCount, isLoading } = useHomeDreams(year, month);

  return (
    <div className="grid h-full min-w-0 grid-rows-[minmax(0,3fr)_minmax(0,7fr)]">
      <HomeGreeting nickname={user.nickname} totalCount={totalCount} />
      <HomeDreamSection
        year={year}
        month={month}
        setYear={setYear}
        setMonth={setMonth}
        dreams={dreams}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HomePage;

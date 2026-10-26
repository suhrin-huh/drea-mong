import { Link } from 'react-router-dom';
import StatisticsIcon from '@/shared/ui/icons/StatisticsIcon';
import YearSelector from './YearSelector';
import MonthSelector from './MonthSelector';
import DreamList from './DreamList';

const HomeDreamSection = ({ year, month, setYear, setMonth, dreams, isLoading }) => (
  <section
    className="flex min-h-0 min-w-0 flex-col rounded-t-3xl bg-white px-1 py-2"
    aria-labelledby="home-dreams-heading"
  >
    <h2 id="home-dreams-heading" className="sr-only">
      나의 꿈 기록
    </h2>
    <header className="relative flex-none px-11 pb-2 pt-1 text-center">
      <Link
        to="/statistics"
        className="absolute right-2 top-0.5 grid h-10 w-10 place-items-center p-1.5 [&_svg]:h-[26px] [&_svg]:w-[26px]"
        aria-label="꿈 통계 보기"
      >
        <span aria-hidden="true">
          <StatisticsIcon />
        </span>
      </Link>
      <YearSelector year={year} setYear={setYear} />
    </header>
    <MonthSelector month={month} setMonth={setMonth} />
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 pb-2"
      role="region"
      aria-label="꿈 목록"
    >
      <DreamList dreams={dreams} isLoading={isLoading} year={year} month={month} />
    </div>
  </section>
);

export default HomeDreamSection;

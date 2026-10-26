import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const YearSelector = ({ year, setYear }) => (
  <div className="flex items-center justify-center text-base">
    <button
      type="button"
      aria-label="이전 연도"
      disabled={year <= 1900}
      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-40 [@media(hover:hover)]:enabled:hover:bg-primary-500/10 [@media(hover:hover)]:enabled:hover:text-primary-700"
      onClick={() => setYear((previous) => Math.max(previous - 1, 1900))}
    >
      <IoChevronBack size={20} aria-hidden="true" />
    </button>
    <p className="whitespace-nowrap px-3 font-semibold" aria-live="polite">
      {year}년
    </p>
    <button
      type="button"
      aria-label="다음 연도"
      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 [@media(hover:hover)]:hover:bg-primary-500/10 [@media(hover:hover)]:hover:text-primary-700"
      onClick={() => setYear((previous) => previous + 1)}
    >
      <IoChevronForward size={20} aria-hidden="true" />
    </button>
  </div>
);

export default YearSelector;

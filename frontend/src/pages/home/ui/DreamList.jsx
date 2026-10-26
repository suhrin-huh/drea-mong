import { Link } from 'react-router-dom';

const DreamList = ({ year, month, dreams, isLoading }) => {
  if (isLoading || !dreams?.length) {
    return (
      <p
        role="status"
        className="flex flex-1 items-center justify-center whitespace-pre-line px-4 py-4 text-center text-slate-600"
      >
        {isLoading ? (
          <>
            <span
              className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-primary-500 motion-safe:animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">꿈 기록을 불러오고 있습니다.</span>
          </>
        ) : (
          '작성된 일기가 없습니다.\n꿈을 기록해보세요.'
        )}
      </p>
    );
  }

  return (
    <ul aria-label={`${year}년 ${month}월 꿈 기록`}>
      {dreams.map((dream) => {
        const date = `${dream.writeTime.slice(0, 4)}-${dream.writeTime.slice(4, 6)}-${dream.writeTime.slice(6, 8)}`;
        const weekday = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        return (
          <li key={dream.dreamId} className="grid grid-cols-[48px_minmax(0,1fr)] items-center py-1.5">
            <time dateTime={date} className="pr-3 text-center">
              <span className="block text-lg font-medium tabular-nums leading-6 text-slate-700">
                {dream.writeTime.slice(6, 8)}
              </span>
              <span className="block pt-0.5 text-xs font-normal leading-4 text-slate-500">{weekday}</span>
            </time>
            <Link
              to={`/dream/${dream.dreamId}`}
              aria-label={`${date} 꿈: ${dream.content}`}
              className={`flex min-h-14 min-w-0 items-center rounded-lg bg-cover bg-center px-3 py-2.5 text-white focus-visible:outline-primary-500 ${dream.image ? 'bg-black/50 bg-blend-darken' : 'bg-primary-500'}`}
              style={dream.image ? { backgroundImage: `url(${dream.image})` } : undefined}
            >
              <span className="min-w-0 truncate">{dream.content}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default DreamList;

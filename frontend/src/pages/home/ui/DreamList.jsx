import { useNavigate } from 'react-router-dom';

const DreamList = ({ year, month, dreams, scrollToHeader }) => {
  const navigate = useNavigate();

  const handleClick = (dreamId) => {
    scrollToHeader();
    navigate(`/dream/${dreamId}`);
  };

  const getWeekDay = (dateStr) => {
    const date = new Date(year, month - 1, parseInt(dateStr.slice(6, 8)));
    const option = { weekday: 'long' };
    return date.toLocaleDateString('en-US', option).slice(0, 3).toUpperCase();
  };

  return (
    <div className="mt-2 h-3/4 flex-col overflow-y-auto pb-14">
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
        </div>
      )}
    </div>
  );
};

export default DreamList;

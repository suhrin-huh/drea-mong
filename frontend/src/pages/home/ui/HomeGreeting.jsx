const HomeGreeting = ({ nickname, totalCount }) => (
  <header className="flex min-h-0 flex-col items-center justify-center gap-2 overflow-auto px-4 py-3 text-center text-white [overflow-wrap:anywhere]">
    <h1 className="text-2xl font-bold">{nickname ? `안녕하세요, ${nickname}님!` : '안녕하세요!'}</h1>
    <p className="text-sm">{totalCount ? `${totalCount + 1}번째 꿈을 기록해주세요.` : '첫번째 꿈을 기록해주세요!'}</p>
  </header>
);

export default HomeGreeting;

const DreamSquareSkeletonPage = () => {
  return (
    <div className="relative flex flex-wrap justify-around bg-[rgb(34,34,34)] p-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="mb-2 h-40 w-40 animate-pulse rounded-[30px] bg-gray-500"></div>
      ))}
    </div>
  );
};

export default DreamSquareSkeletonPage;

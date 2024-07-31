const DreamSquareSkeletonPage = () => {
  return (
    <div className="flex flex-wrap justify-around p-6 relative bg-[rgb(34,34,34)]">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="w-40 h-40 mb-2 bg-gray-500 animate-pulse rounded-[30px]"
        ></div>
      ))}
    </div>
  );
};

export default DreamSquareSkeletonPage;
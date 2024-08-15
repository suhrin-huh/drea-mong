const SquareDetailSkeletonPage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#222222]">
      <div className="relative mb-4 mt-12 w-4/5">
        <div className="w-full pt-[100%]"></div>
        <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-[30px] bg-gray-500"></div>
      </div>
      <div className="relative mb-4 h-20 w-4/5">
        <div className="w-full pt-[18%]"></div>
        <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-[20px] bg-gray-500"></div>
      </div>
      <div className="h-full w-full flex-grow rounded-t-3xl bg-white p-4">
        {/* 댓글 SkeletonUI */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="m-4 flex items-center">
            <div className="ml-4 flex w-full flex-col">
              <div className="mb-2 h-4 w-1/3 animate-pulse rounded-full bg-gray-300"></div>
              <div className="h-4 w-full animate-pulse rounded-full bg-gray-300"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SquareDetailSkeletonPage;

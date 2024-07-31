const DreamSquareDetailSkeletonPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#222222]">
        <div className="relative w-4/5 mt-12 mb-4">
            <div className="w-full pt-[100%]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gray-500 rounded-[30px] animate-pulse"></div>
        </div>
        <div className="relative w-4/5 mb-4">
            <div className="w-full pt-[18%]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gray-500 rounded-[20px] animate-pulse"></div>
        </div>
        <div className="w-full h-full p-4 bg-white rounded-t-lg">
            {/* 댓글 SkeletonUI */}
            {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center m-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex flex-col w-full ml-4">
                <div className="w-1/3 h-4 mb-2 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-full h-4 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
            </div>
            ))}
        </div>
    </div>
  );
};

export default DreamSquareDetailSkeletonPage;
const SquareSkeleton = () => (
  <div role="status" className="w-full max-w-3xl pt-3 sm:pt-4">
    <span className="sr-only">공유된 꿈을 불러오는 중입니다.</span>
    <div aria-hidden="true" className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={`dream-placeholder-${index}`} className="aspect-square rounded-2xl bg-neutral-700" />
      ))}
    </div>
  </div>
);

export default SquareSkeleton;

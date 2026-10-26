import { Link } from 'react-router-dom';
import useSquareDreams from '../model/useSquareDreams';
import SquareSkeleton from './SquareSkeleton';

const SquarePage = () => {
  const { dreams, loading, hasMore, loadMoreRef } = useSquareDreams();

  return (
    <section aria-labelledby="square-title" className="min-h-full px-4 py-6 sm:px-6">
      <ul aria-label="공유된 꿈" aria-busy={loading} className="mx-auto grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
        {dreams.map((dream) => (
          <li key={dream.dreamId} className="min-w-0">
            <Link
              to={`/square/${dream.dreamId}`}
              aria-label={`공유된 꿈 ${dream.dreamId} 자세히 보기`}
              className="group block overflow-hidden rounded-md bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              <img
                src={dream.image}
                alt="공유된 꿈 이미지"
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>

      {loading && <SquareSkeleton />}
      {!loading && dreams.length === 0 && (
        <p className="py-16 text-center text-sm text-neutral-400">아직 공유된 꿈이 없어요.</p>
      )}
      {hasMore && <div ref={loadMoreRef} aria-hidden="true" className="h-px" />}
    </section>
  );
};

export default SquarePage;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasApiSession } from '@/shared/config/api-mode';
import squareApi from '@/shared/api/modules/square.api';

const useSquareDreams = () => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState([]);
  const [cursorId, setCursorId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const requesting = useRef(false);
  const loadMoreRef = useRef(null);
  const hasSession = hasApiSession();

  const fetchDreams = useCallback(
    async (cursor = null) => {
      if (requesting.current) return;
      requesting.current = true;
      setLoading(true);

      try {
        const response = await squareApi.getDreams({ cursorId: cursor, size: 10 });
        const newDreams = response.data.data;

        setDreams((previous) => {
          const existingIds = new Set(previous.map((dream) => dream.dreamId));
          return [...previous, ...newDreams.filter((dream) => !existingIds.has(dream.dreamId))];
        });
        if (newDreams.length > 0) {
          setCursorId(newDreams[newDreams.length - 1].dreamId);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        navigate(error.response?.status === 401 ? '/login' : '/error');
      } finally {
        requesting.current = false;
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!hasSession) {
      navigate('/login');
      return;
    }
    fetchDreams();
  }, [hasSession, navigate, fetchDreams]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || !hasMore || !hasSession) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchDreams(cursorId);
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, hasMore, hasSession, cursorId, fetchDreams]);

  return { dreams, loading, hasMore, loadMoreRef };
};

export default useSquareDreams;

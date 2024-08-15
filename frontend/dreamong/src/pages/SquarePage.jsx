import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRecoilValue } from 'recoil';
import Swal from 'sweetalert2';
import { baseURLState } from '../recoil/atoms';
import SquareSkeletonPage from './SkeletonPage/SquareSkeletonPage'; // SquareSkeletonPage 컴포넌트 import

const SquarePage = () => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const baseURL = useRecoilValue(baseURLState);

  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };
  const mainRef = useRef(null);
  const ScrollToDiv = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
      console.log(window.scrollY);
    }
  };

  const accessToken = localStorage.getItem('accessToken');
  useEffect(() => {
    ScrollToDiv();
    if (!accessToken) return navigate('/login');

    // 1초 후에 로딩 상태를 false로 변경
    const timer = setTimeout(() => setLoading(false), 1500);

    fetchDreams();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, []);

  const fetchDreams = async (cursorId = null, size = 10) => {
    try {
      const response = await axios.get(`${baseURL}/square/dreams`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
        params: {
          cursorId: cursorId,
          size: size,
        },
      });
      const newDreams = response.data.data;
      setDreams((prevDreams) => {
        const existingDreamIds = new Set(prevDreams.map((dream) => dream.dreamId));
        const uniqueDreams = newDreams.filter((dream) => !existingDreamIds.has(dream.dreamId));
        return [...prevDreams, ...uniqueDreams];
      });
      setHasMore(response.data.totalPages > page + 1);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        console.error('오류 발생:', error);
        navigate('/error');
      }
    }
  };

  const handleSquareClick = (dreamId) => {
    navigate(`/square/${dreamId}`);
  };

  if (loading) {
    return <SquareSkeletonPage />;
  }

  return (
    <div ref={mainRef} className="h-screen bg-[#222222] p-6">
      <InfiniteScroll
        dataLength={dreams.length}
        next={fetchDreams}
        hasMore={hasMore}
        className="flex flex-wrap justify-between"
      >
        {dreams.map((dream) => (
          <div
            key={dream.dreamId}
            className="mb-4 h-40 w-40 cursor-pointer rounded-[30px]"
            onClick={() => handleSquareClick(dream.dreamId)}
            style={{ backgroundImage: `url(${dream.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default SquarePage;

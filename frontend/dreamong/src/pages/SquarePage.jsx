import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRecoilValue } from 'recoil';
import Swal from 'sweetalert2';
import { baseURLState } from '../recoil/atoms';

const SquarePage = () => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const baseURL = useRecoilValue(baseURLState);

  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async (cursorId = null, size = 10) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${baseURL}/square/dreams`,
        {
          params: {
            cursorId: cursorId,
            size: size,
          },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const newDreams = response.data.data;

      setDreams((prevDreams) => {
        const existingDreamIds = new Set(prevDreams.map((dream) => dream.dreamId));
        const uniqueDreams = newDreams.filter((dream) => !existingDreamIds.has(dream.dreamId));
        return [...prevDreams, ...uniqueDreams];
      });

      setHasMore(response.data.totalPages > page + 1);
      setPage((prevPage) => prevPage + 1);
    } catch {
      handleError();
    }
  };

  const handleSquareClick = (dreamId) => {
    navigate(`/square/${dreamId}`);
  };

  return (
    <div className="h-screen bg-[#222222] p-6">
      <InfiniteScroll
        dataLength={dreams.length}
        next={fetchDreams}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        className="flex flex-wrap justify-between"
      >
        {dreams.map((dream) => (
          <div
            key={dream.dreamId}
            className="mb-4 h-40 w-40 cursor-pointer rounded-[30px] bg-gray-500"
            onClick={() => handleSquareClick(dream.dreamId)}
            style={{ backgroundImage: `url(${dream.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default SquarePage;

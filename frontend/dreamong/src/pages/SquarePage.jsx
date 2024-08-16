import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import Swal from 'sweetalert2';
import { baseURLState } from '../recoil/atoms';
import SquareSkeletonPage from './SkeletonPage/SquareSkeletonPage';

const SquarePage = () => {
  const navigate = useNavigate();

  const [dreams, setDreams] = useState([]);
  // 페이지네이션을 위한 커서 ID
  const [cursorId, setCursorId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const baseURL = useRecoilValue(baseURLState);

  // IntersectionObserver를 위한 ref
  const observer = useRef();

  const handleError = () => {
    Swal.fire({
      title: 'ERROR',
      text: '오류가 발생했습니다.',
      icon: 'error',
      confirmButtonText: '돌아가기',
    });
  };

  // 페이지 최상단으로 스크롤하기 위한 ref와 함수
  const mainRef = useRef(null);
  const ScrollToDiv = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 로컬 스토리지에서 액세스 토큰 가져오기
  const accessToken = localStorage.getItem('accessToken');

  // 꿈 데이터를 가져오는 함수
  const fetchDreams = useCallback(
    (cursorId = null, size = 10) => {
      console.log(`Fetching dreams with cursorId: ${cursorId}`);
      axios({
        method: 'get',
        url: `${baseURL}/square/dreams`,
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
        params: {
          cursorId: cursorId,
          size: size,
        },
      })
        .then((response) => {
          const newDreams = response.data.data;
          console.log('newDreams', newDreams);
          if (newDreams.length > 0) {
            // 중복 제거 후 새로운 꿈 추가
            setDreams((prevDreams) => {
              const existingDreamIds = new Set(prevDreams.map((dream) => dream.dreamId));
              const uniqueDreams = newDreams.filter((dream) => !existingDreamIds.has(dream.dreamId));
              return [...prevDreams, ...uniqueDreams];
            });
            // 새로운 커서 ID 설정
            const newCursorId = newDreams[newDreams.length - 1].dreamId;
            setCursorId(newCursorId);
          } else {
            // 더 이상 로드할 데이터가 없음
            setHasMore(false);
            console.log('없음');
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            // 인증 오류 시 로그인 페이지로 이동
            navigate('/login');
          } else {
            // 기타 오류 처리
            console.error('오류 발생:', error);
            navigate('/error');
          }
        });
    },
    [baseURL, accessToken, navigate],
  );

  // IntersectionObserver를 위한 콜백 함수
  const lastDreamElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // 마지막 요소가 화면에 보이고, 더 로드할 데이터가 있으면 fetchDreams 호출
          fetchDreams(cursorId);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, cursorId, fetchDreams],
  );

  useEffect(() => {
    ScrollToDiv();
    if (!accessToken) return navigate('/login');

    const timer = setTimeout(() => setLoading(false), 1500);

    fetchDreams();
    // 컴포넌트 언마운트 시 타이머 클리어
    return () => clearTimeout(timer);
  }, [accessToken, navigate, fetchDreams]);

  // 꿈 상세 페이지로 이동하는 함수
  const handleSquareClick = (dreamId) => {
    navigate(`/square/${dreamId}`);
  };

  if (loading) {
    return <SquareSkeletonPage />;
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-[#222222] p-6">
      <div className="flex flex-wrap justify-between">
        {dreams.map((dream, index) => (
          <div
            key={dream.dreamId}
            // 마지막 요소에 ref 설정
            ref={index === dreams.length - 1 ? lastDreamElementRef : null}
            className="mb-4 h-40 w-40 cursor-pointer rounded-[30px]"
            onClick={() => handleSquareClick(dream.dreamId)}
            style={{ backgroundImage: `url(${dream.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SquarePage;

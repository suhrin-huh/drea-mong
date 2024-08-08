import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { baseURLState, userState } from '../recoil/atoms';

const SquareDetailPage = () => {
  const { dreamId } = useParams();
  const [isToggled, setIsToggled] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [comments, setComments] = useState([]);
  const baseURL = useRecoilValue(baseURLState);
  const user = useRecoilValue(userState);

  useEffect(() => {
    fetchDreamDetail();
  }, []);

  const fetchDreamDetail = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`${baseURL}/square/${dreamId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { userId: user.userId },
      });
      const data = response.data.data;
      setSummary(data.summary);
      setContent(data.content);
      setImage(data.image);
      setComments(data.comments);
    } catch (error) {
      Swal.fire({
        title: 'ERROR',
        text: '오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '돌아가기',
      });
    }
  };

  const handleToggleClick = () => {
    setIsToggled(!isToggled);
  };

  const handleLikeClick = (id) => {
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              likesCount: comment.liked ? comment.likesCount - 1 : comment.likesCount + 1,
              liked: !comment.liked,
            }
          : comment,
      ),
    );
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#222222]">
      {/* 꿈 이미지 */}
      <div className="flex w-4/5 mx-auto mt-12 mb-4">
        <div className="relative w-full pt-[100%]">
          <div
            className="absolute left-0 top-0 h-full w-full rounded-[30px] bg-gray-500"
            style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        </div>
      </div>
      {/* 꿈 내용 토글 */}
      <div
        className={`align-center relative w-4/5 transition-all duration-300 ease-in-out ${isToggled ? 'h-96' : 'h-20'}`}
        onClick={handleToggleClick}
      >
        <div className="flex h-full w-full cursor-pointer items-center justify-center rounded-[20px] bg-[#1a1819] px-4 text-white">
          {isToggled ? (
            <div className="w-full text-left">
              {/* 요약 */}
              <div className="flex items-center gap-4 mb-4">
                <p className="text-sm whitespace-nowrap md:text-base lg:text-lg">요약: </p>
                <p className="text-sm md:text-base lg:text-lg">{summary}</p>
              </div>
              <hr className="my-4 border-gray-700" />
              <p className="text-sm md:text-base lg:text-lg">{content}</p>
            </div>
          ) : (
            <span className="text-sm md:text-md lg:text-base">💡 어떤 꿈인지 궁금하시나요? 클릭해보세요!</span>
          )}
        </div>
      </div>

      {/* 꿈 댓글 */}
      <div className={`mt-4 ${isToggled ? 'max-h-60' : 'flex-grow'} w-full overflow-y-auto rounded-t-3xl bg-white p-4`}>
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-center m-5">
            <div className="flex flex-col justify-center w-full ml-4">
              <div className="mb-2 text-base text-black">{comment.nickname}</div>
              <div className="text-sm text-black">{comment.content}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div
                className="flex items-center justify-center w-6 h-6 cursor-pointer"
                onClick={() => handleLikeClick(comment.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className={`bi bi-heart ${comment.liked ? 'text-red-500' : ''}`}
                  viewBox="0 0 16 16"
                >
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                </svg>
              </div>
              <div className="w-10 h-full text-xs text-center">{comment.likesCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SquareDetailPage;

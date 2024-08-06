import React, { useState } from 'react';

const SquareDetailPage = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [summary, setSummary] = useState(
    '고양이와 토끼와 밤하늘에서 떨어진 운석을 함께 바라보며 신비로운 밤을 보낸 꿈',
  );
  const [content, setContent] = useState(
    '고양이는 밤하늘을 바라보며 언덕 위에 앉아 있었다. 그날 밤은 유난히 고요했고, 달빛이 언덕을 은은하게 비추고 있었다. 고양이는 은빛으로 빛나는 하늘을 응시하며 무언가를 기다리는 듯했다. 그러던 중, 하늘에서 작은 빛이 빠르게 떨어지는 것을 보았다. 운석이었다. 고양이는 그 빛을 따라 숲 속으로 사라졌다. 언덕 아래에서는 토끼가 나뭇잎 사이에서 고개를 내밀고 있었다. 운석이 떨어진 곳에서 이상한 빛이 반짝이고 있었고, 토끼는 두려움을 무릅쓰고 천천히 그쪽으로 다가갔다. 밤의 정적 속에서 운석이 빛나는 장면은 신비로웠고, 고양이와 토끼는 그렇게 언덕 위에서 운석을 바라보며 밤을 보냈다.',
  );
  const [comments, setComments] = useState([
    { id: 1, content: 'This is a new comment', likesCount: 50, nickname: 'testuser' },
    { id: 2, content: 'This is a new comment', likesCount: 30, nickname: 'testuser' },
    { id: 3, content: 'This is a new comment', likesCount: 12, nickname: 'testuser' },
    { id: 4, content: 'This is a new comment', likesCount: 6, nickname: 'testuser' },
    { id: 5, content: 'This is a new comment', likesCount: 3, nickname: 'testuser' },
  ]);

  const handleToggleClick = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#222222]">
      {/* 꿈 이미지 */}
      <div className="mx-auto mb-4 mt-12 flex w-4/5">
        <div className="relative w-full pt-[100%]">
          <div className="absolute left-0 top-0 h-full w-full rounded-[30px] bg-gray-500"></div>
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
              <div className="mb-4 flex items-center gap-4">
                <p className="whitespace-nowrap text-sm md:text-base lg:text-lg">요약: </p>
                <p className="text-sm md:text-base lg:text-lg">{summary}</p>
              </div>
              <hr className="my-4 border-gray-700" />
              <p className="text-sm md:text-base lg:text-lg">{content}</p>
            </div>
          ) : (
            <span className="md:text-md text-sm lg:text-base">💡 어떤 꿈인지 궁금하시나요? 클릭해보세요!</span>
          )}
        </div>
      </div>

      {/* 꿈 댓글 */}
      <div className={`mt-4 ${isToggled ? 'max-h-60' : 'flex-grow'} w-full overflow-y-auto rounded-t-3xl bg-white p-4`}>
        {comments.map((comment) => (
          <div key={comment.id} className="m-5 flex items-center">
            <div className="ml-4 flex w-full flex-col justify-center">
              <div className="mb-2 text-base text-black">{comment.nickname}</div>
              <div className="text-sm text-black">{comment.content}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-6 w-6 items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-heart"
                  viewBox="0 0 16 16"
                >
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                </svg>
              </div>
              <div className="h-full w-10 text-center text-xs">{comment.likesCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SquareDetailPage;

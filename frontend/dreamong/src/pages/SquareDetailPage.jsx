import React, { useState } from 'react';

const SquareDetailPage = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [summary, setSummary] = useState(
    '고양이와 토끼와 밤하늘에서 떨어진 운석을 함께 바라보며 신비로운 밤을 보낸 꿈',
  );
  const [content, setContent] = useState(
    '고양이는 밤하늘을 바라보며 언덕 위에 앉아 있었다. 그날 밤은 유난히 고요했고, 달빛이 언덕을 은은하게 비추고 있었다. 고양이는 은빛으로 빛나는 하늘을 응시하며 무언가를 기다리는 듯했다. 그러던 중, 하늘에서 작은 빛이 빠르게 떨어지는 것을 보았다. 운석이었다. 고양이는 그 빛을 따라 숲 속으로 사라졌다. 언덕 아래에서는 토끼가 나뭇잎 사이에서 고개를 내밀고 있었다. 운석이 떨어진 곳에서 이상한 빛이 반짝이고 있었고, 토끼는 두려움을 무릅쓰고 천천히 그쪽으로 다가갔다. 밤의 정적 속에서 운석이 빛나는 장면은 신비로웠고, 고양이와 토끼는 그렇게 언덕 위에서 운석을 바라보며 밤을 보냈다.',
  );
  //   const [comments, setComments] = useState([
  //     { id: 1, content: 'This is a new comment', likesCount: 0, nickname: 'testuser' },
  //     { id: 2, content: 'This is a new comment', likesCount: 0, nickname: 'testuser' },
  //     { id: 3, content: 'This is a new comment', likesCount: 0, nickname: 'testuser' },
  //     { id: 4, content: 'This is a new comment', likesCount: 0, nickname: 'testuser' },
  //   ]);

  const handleToggleClick = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div className="flex h-screen flex-col bg-[#222222]">
      {/*꿈 이미지*/}
      <div className="mx-auto mb-4 mt-12 flex w-4/5 flex-col items-center justify-center">
        <div className="relative w-full pt-[100%]">
          <div className="absolute left-0 top-0 h-full w-full rounded-[30px] bg-gray-500"></div>
        </div>
      </div>

      {/*꿈 내용 토글*/}
      <div
        className={`relative mx-auto w-4/5 transition-all duration-300 ease-in-out ${isToggled ? 'h-96' : 'h-20'}`}
        onClick={handleToggleClick}
      >
        <div className="flex h-full cursor-pointer items-center justify-center rounded-[20px] bg-[#1a1819] px-4 text-white">
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

      {/* Comments Section */}
      {/* <div className="mt-4 w-full flex-grow overflow-y-auto rounded-t-lg bg-white p-4">
        {comments.map((comment) => (
          <div key={comment.id} className="m-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
            <div className="ml-4 flex w-full flex-col">
              <div className="mb-2 h-4 w-1/3 rounded-full bg-gray-300"></div>
              <div className="h-4 w-full rounded-full bg-gray-300"></div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default SquareDetailPage;

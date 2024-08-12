// React 관련 패키지
import { useEffect, useRef } from 'react';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState } from 'recoil';
import { isListeningState } from '../../../recoil/atoms';

// 외부 라이브러리

// 앱 내부의 컴포넌트/아이콘

import { useHandleError } from '../../../utils/utils';

/** - 꿈 내용 작성 textarea / STT
 * - 내용 작성시에 isInterpVisible = false
 * - 오류 발생시 현재 페이지
 * - webkitSpeechRecognition 사용 */
const ContentBox = ({ content, setContent, MAX_LENGTH, setIsInterpVisible, classList }) => {
  const [isListening, setIsListening] = useRecoilState(isListeningState);
  const contentRef = useRef(null);
  const handleError = useHandleError();

  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false; // 중간 결과 포함여부

  useEffect(() => {
    if (isListening) {
      // 녹음이 시작하면
      recognition.start();
    }
  }, [isListening]);

  recognition.onstart = () => {
    setIsListening(true);
    console.log('start!');
  };

  // 녹음이 끝나면 icon 변경
  recognition.onspeechend = () => {
    setIsListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    setIsListening(false);
    const transcript = event.results[0][0].transcript;
    insertTextAtCursor(transcript);
  };

  recognition.onerror = () => {
    recognition.stop();
    setIsListening(false);
    handleError();
  };

  /** content 속 커서가 위치한 곳에 음성내용 반영 */
  const insertTextAtCursor = (textToInsert) => {
    // 현재 contentRef가 위치한 태그
    if (contentRef.current) {
      const contentArea = contentRef.current;
      const startPoint = contentArea.selectionStart;
      const endPoint = contentArea.selectionEnd;
      const newContent = content.slice(0, startPoint) + textToInsert + content.slice(endPoint);
      // 설정한 MAX_LENGTH까지만 입력 가능하도록 설정
      setContent(newContent.slice(0, MAX_LENGTH));
    } else {
      setContent((prev) => (prev + textToInsert).slice(0, MAX_LENGTH));
    }
  };

  const handleContent = (e) => {
    setIsInterpVisible(false);
    if (e.target.value.length <= MAX_LENGTH) {
      setContent(e.target.value);
    } else {
      setContent(e.target.value.slice(0, MAX_LENGTH));
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={contentRef}
        className={`${classList} h-40 w-full resize-none placeholder:text-slate-300`}
        value={content}
        onChange={(e) => {
          handleContent(e);
        }}
        placeholder="꿈 내용을 입력해주세요."
      ></textarea>
      <p className="absolute bottom-5 right-2 text-slate-500">
        {content.length}/{MAX_LENGTH}
      </p>
    </div>
  );
};

export default ContentBox;

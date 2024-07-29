import { postDreamBody } from '../http.js';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceToText = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // useEffect(() => {
  //   console.log(transcript)
  // }, [transcript])

  if (!browserSupportsSpeechRecognition) {
    return <p>브라우저가 음성 인식을 지원하지 않습니다.</p>;
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });

  const customSubmit = (event) => {
    event.preventDefault();
    postDreamBody(event.target[0].value);
    console.dir(event.target[0].value); // console 테스트 확인용
  };

  return (
    <>
      <div className="p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">음성 인식</h2>
        <div className="mb-4 space-x-2">
          <button className={`px-4 py-2 rounded ${listening ? 'bg-red-500' : 'bg-blue-500'} text-white`} onClick={listening ? SpeechRecognition.stopListening : startListening}>
            {listening ? '중지' : '시작'}
          </button>
          <button className="px-4 py-2 rounded bg-gray-500 text-white" onClick={resetTranscript}>
            초기화
          </button>
        </div>
        <div className="bg-white p-4 rounded">
          <p className="text-lg">상태: {listening ? '듣는 중' : '대기 중'}</p>
          <p className="text-lg mt-2">인식된 텍스트:</p>
          <form onSubmit={customSubmit}>
            <input type="text" id="dream" name="dream" defaultValue={transcript} className="h-24 w-full" />
            <button type="submit" className="p-2 rounded-md text-white bg-cyan-600">
              제출하기
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VoiceToText;

import { Link, useLocation } from 'react-router-dom';
import { MainIcon, SquareIcon, CreateIcon, StreamingIcon, SettingsIcon, STTIcon } from '../assets/icons';
import { useRecoilState } from 'recoil';
import { isListeningState } from '../recoil/atoms';

const NavigationBar = () => {
  const location = useLocation();
  const paths = [
    {
      pathname: '/',
      icon: (color) => <MainIcon color={color} />,
    },
    {
      pathname: '/square/dreams',
      icon: (color) => <SquareIcon color={color} />,
    },
    {
      pathname: '/dream/create',
      icon: (color) => <CreateIcon color={color} />,
    },
    {
      pathname: '/streaming',
      icon: (color) => <StreamingIcon color={color} />,
    },
    {
      pathname: '/settings',
      icon: (color) => <SettingsIcon color={color} />,
    },
  ];

  // 음성인식을 사용할 url
  const useSTTPath = ['/dream/create', '/dream/'];

  /** 아이콘 컬러색상 변경 */
  const MAIN_COLOR = '#737DFE';
  const SECONDARY_COLOR = '#000000';

  const [isListening, setIsListening] = useRecoilState(isListeningState);
  const handleSTT = async () => {
    setIsListening((prev) => !prev);
  };

  // path에 따라서 렌더링되는 내용이 바뀌도록 설정
  return location.pathname == '/login' ? null : (
    <div className="fixed bottom-0 h-[60px] max-w-[600px] bg-white text-white last:w-full">
      <div className="mx-4 my-3 flex justify-between">
        {paths.map(({ pathname, icon }) => {
          const isCurrentPath = location.pathname === pathname;
          const iconColor = isCurrentPath ? MAIN_COLOR : SECONDARY_COLOR;

          // paths 내부에서 pathname == "/dream/create"인 path에 대해서
          /** 현재 경로가 useSTTPath(STT를 사용하는 경로)에 해당될 때 true 반환 */
          const isSTTActive =
            pathname == '/dream/create' && useSTTPath.some((path) => location.pathname.includes(path));
          // STTIcon 사용시에는 Link 연결 X
          if (isSTTActive) {
            return (
              <div className="relative" key={pathname}>
                <STTIcon handleSTT={handleSTT}></STTIcon>;
              </div>
            );
          }
          return (
            <Link key={pathname} to={pathname} className="relative">
              {icon(iconColor)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;

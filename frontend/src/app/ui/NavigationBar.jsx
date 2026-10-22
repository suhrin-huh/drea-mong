import { Link, useLocation } from 'react-router-dom';
import HomeNavigationItem from '@/app/ui/HomeNavigationItem';
import SquareNavigationItem from '@/app/ui/SquareNavigationItem';
import CreateNavigationItem from '@/app/ui/CreateNavigationItem';
import StreamingNavigationItem from '@/app/ui/StreamingNavigationItem';
import SettingsNavigationItem from '@/app/ui/SettingsNavigationItem';
import { SpeechInputButton } from '@/features/dream-editor';
import { useRecoilState } from 'recoil';
import { isListeningState } from '@/features/dream-editor';

const NavigationBar = () => {
  const location = useLocation();
  const paths = [
    {
      pathname: '/',
      icon: (color) => <HomeNavigationItem color={color} />,
    },
    {
      pathname: '/square/dreams',
      icon: (color) => <SquareNavigationItem color={color} />,
    },
    {
      pathname: '/dream/create',
      icon: (color) => <CreateNavigationItem color={color} />,
    },
    {
      pathname: '/streaming',
      icon: (color) => <StreamingNavigationItem color={color} />,
    },
    {
      pathname: '/settings',
      icon: (color) => <SettingsNavigationItem color={color} />,
    },
  ];

  // 음성인식을 사용할 url
  const useSTTPath = ['/dream/create', '/dream/'];

  /** 아이콘 컬러색상 변경 */
  const MAIN_COLOR = '#737DFE';
  const SECONDARY_COLOR = '#000000';

  const [isListening, setIsListening] = useRecoilState(isListeningState);
  const handleSTT = async () => {
    if (!isListening) {
      setIsListening(true);
    }
  };

  // path에 따라서 렌더링되는 내용이 바뀌도록 설정
  return location.pathname == '/login' ? null : (
    <div className="fixed bottom-0 z-50 max-w-[600px] bg-white py-1 text-white last:w-full">
      <div className="mx-5 my-3 flex justify-between">
        {paths.map(({ pathname, icon }) => {
          const isCurrentPath = location.pathname === pathname;
          const iconColor = isCurrentPath ? MAIN_COLOR : SECONDARY_COLOR;

          // paths 내부에서 pathname == "/dream/create"인 path에 대해서
          /** 현재 경로가 useSTTPath(STT를 사용하는 경로)에 해당될 때 true 반환 */
          const isSTTActive =
            pathname == '/dream/create' && useSTTPath.some((path) => location.pathname.includes(path));
          // SpeechInputButton 사용시에는 Link 연결 X
          if (isSTTActive) {
            return (
              <div className="relative w-[35px]" key={pathname}>
                <SpeechInputButton handleSTT={handleSTT}></SpeechInputButton>
              </div>
            );
          }
          return (
            <Link key={pathname} to={pathname} className="relative w-[35px]">
              {icon(iconColor)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;

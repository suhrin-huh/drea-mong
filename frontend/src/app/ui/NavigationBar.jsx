import { useId } from 'react';
import { IoHome, IoGrid } from 'react-icons/io5';
import { FaMusic, FaGear } from 'react-icons/fa6';
import NavigationItem from '@/app/ui/NavigationItem';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import CreateNavigationItem from '@/app/ui/CreateNavigationItem';
import { SpeechInputButton, isListeningState } from '@/features/dream-editor';

const NavigationBar = () => {
  const location = useLocation();
  const gradientId = `navigation-gradient-${useId().replace(/:/g, '')}`;
  const items = [
    { pathname: '/', label: 'HOME', Icon: IoHome },
    { pathname: '/square/dreams', activePath: '/square', label: 'SQUARE', Icon: IoGrid },
    { pathname: '/dream/create', isCreate: true },
    { pathname: '/streaming', label: 'MUSIC', Icon: FaMusic },
    { pathname: '/settings', label: 'SETTINGS', Icon: FaGear },
  ];
  const isDreamPage = location.pathname.startsWith('/dream/');

  /** 아이콘 컬러색상 변경 */
  const MAIN_COLOR = `url(#${gradientId})`;
  const SECONDARY_COLOR = '#000000';

  const [isListening, setIsListening] = useRecoilState(isListeningState);
  const handleSTT = () => {
    if (!isListening) {
      setIsListening(true);
    }
  };

  return location.pathname === '/login' ? null : (
    <nav
      className="relative z-50 w-full flex-none bg-white pb-[calc(4px+env(safe-area-inset-bottom,0px))] pt-1 text-white"
      aria-label="주요 메뉴"
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7C81F2" />
            <stop offset="100%" stopColor="#E9C3CE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mx-5 my-3 flex items-center justify-between">
        {items.map(({ pathname, activePath = pathname, label, Icon, isCreate }) => {
          const isCurrentPath =
            location.pathname === activePath || (activePath !== '/' && location.pathname.startsWith(`${activePath}/`));
          const iconColor = isCurrentPath ? MAIN_COLOR : SECONDARY_COLOR;

          if (isCreate && isDreamPage) {
            return (
              <div className="flex w-[55px] items-center justify-center" key={pathname}>
                <SpeechInputButton handleSTT={handleSTT} />
              </div>
            );
          }
          return (
            <Link
              key={pathname}
              to={pathname}
              aria-current={isCurrentPath ? 'page' : undefined}
              aria-label={isCreate ? '꿈 기록하기' : undefined}
              className={`flex items-center justify-center ${isCreate ? 'w-[55px]' : 'w-[35px]'}`}
            >
              {isCreate ? (
                <CreateNavigationItem />
              ) : (
                <NavigationItem label={label}>
                  <Icon size={28} fill={iconColor} aria-hidden="true" />
                </NavigationItem>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;

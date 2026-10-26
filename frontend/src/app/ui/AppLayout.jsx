import NavigationBar from './NavigationBar';
import NightSky from './NightSky';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }) => (
  <div
    className={`${styles.nightSky} relative isolate mx-auto flex h-screen w-full min-w-0 max-w-[600px] flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)] shadow-[0_0_64px_#34305314] supports-[height:100dvh]:h-dvh`}
  >
    <NightSky />
    <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-y-contain" tabIndex={-1}>
      {children}
    </main>
    <NavigationBar />
  </div>
);

export default AppLayout;

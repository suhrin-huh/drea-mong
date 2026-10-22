import appBackground from '@/shared/assets/backgrounds/app-background.svg';
import NavigationBar from './NavigationBar';

const AppLayout = ({ children }) => (
  <div className="flex min-h-screen justify-center bg-purple-100">
    <div
      className="relative flex h-screen w-full max-w-[600px] flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${appBackground})` }}
    >
      <main className="flex-1 overflow-auto">
        <div className="min-h-full pb-[60px]">{children}</div>
      </main>
      <NavigationBar />
    </div>
  </div>
);

export default AppLayout;

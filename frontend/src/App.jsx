import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { useState, Suspense, lazy } from 'react';

import NavigationBar from './components/NavigationBar';

const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const MainPage = lazy(() => import('./pages/MainPage/MainPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const LoginSuccess = lazy(() => import('./pages/LoginPage/components/LoginSuccess'));
const DreamRegisterPage = lazy(() => import('./pages/DreamPage/DreamRegisterPage'));
const DreamDetailPage = lazy(() => import('./pages/DreamPage/DreamDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const StreamingPage = lazy(() => import('./pages/StreamingPage/StreamingPage'));
const StreamingList = lazy(() => import('./pages/StreamingPage/components/StreamingList'));
const StreamingRoom = lazy(() => import('./pages/StreamingPage/components/StreamingRoom'));
const SquarePage = lazy(() => import('./pages/SquarePage'));
const SquareDetailPage = lazy(() => import('./pages/SquareDetailPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const toggleLoginStatus = () => {
    setIsLoggedIn((prevState) => !prevState);
  };

  return (
    <RecoilRoot>
      <Router>
        <div className="flex min-h-screen justify-center bg-purple-100">
          <div className="relative flex h-screen w-full max-w-[600px] flex-col bg-[url('/src/assets/background.svg')] bg-cover bg-center">
            <main className="flex-1 overflow-auto">
              <div className="min-h-full pb-[60px]">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route exact path="/" element={<MainPage />} />
                    <Route path="/dream/create" element={<DreamRegisterPage />} />
                    <Route path="/dream/:dreamId" element={<DreamDetailPage />} />
                    <Route path="/square/dreams" element={<SquarePage />} />
                    <Route path="/square/:dreamId" element={<SquareDetailPage />} />
                    <Route path="/streaming" element={<StreamingPage />}>
                      <Route index element={<StreamingList />} />
                      <Route path=":roomId" element={<StreamingRoom />} />
                    </Route>
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route
                      path="/login"
                      element={<LoginPage isLoggedIn={isLoggedIn} toggleLoginStatus={toggleLoginStatus} />}
                    />
                    <Route
                      path="/callback"
                      element={<LoginSuccess isLoggedIn={isLoggedIn} toggleLoginStatus={toggleLoginStatus} />}
                    />
                    <Route path="*" element={<ErrorPage />} />
                    <Route path="/error" element={<ErrorPage />} />
                  </Routes>
                </Suspense>
              </div>
            </main>
            <NavigationBar />
          </div>
        </div>
      </Router>
    </RecoilRoot>
  );
}

export default App;

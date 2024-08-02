import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { useState } from 'react';

import NavigationBar from './components/NavigationBar';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage/LoginPage';
import LoginSuccess from './pages/LoginPage/components/LoginSuccess';
import DreamRegisterPage from './pages/DreamRegisterPage';
import DreamDetailPage from './pages/DreamDetailPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState();

  const toggleLoginStatus = () => {
    setIsLoggedIn((prevState) => {
      return !prevState;
    });
  };

  return (
    <RecoilRoot>
      <Router>
        <div className="flex min-h-screen justify-center bg-purple-100">
          <div className="flex w-full max-w-[600px] flex-col bg-[url('/src/assets/background.svg')] bg-cover shadow-lg">
            <main className="flex-grow overflow-auto">
              <Routes>
                <Route exact path="/" element={<MainPage />} />
                <Route path="/dream/create" element={<DreamRegisterPage />} />
                <Route path="/dream/:dreamId" element={<DreamDetailPage />} />
                {/* <Route path="/dream/:dreamId/update" element={} />
                <Route path="/square" element={} />
                <Route path="/square/:dreamId" element={} />
                <Route path="/streaming" element={} />
                <Route path="/streaming/create" element={} />
                <Route path="/streaming/:roomId" element={} />
                <Route path="/statics" element={} /> */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/login"
                  element={<LoginPage isLoggedIn={isLoggedIn} toggleLoginStatus={toggleLoginStatus} />}
                />
                <Route
                  path="/oauth/callback/kakao"
                  element={<LoginSuccess isLoggedIn={isLoggedIn} toggleLoginStatus={toggleLoginStatus} />}
                />
              </Routes>
            </main>
            <NavigationBar />
          </div>
        </div>
      </Router>
    </RecoilRoot>
  );
}

export default App;

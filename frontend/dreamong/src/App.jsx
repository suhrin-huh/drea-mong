import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { useState } from 'react';

import NavigationBar from './components/NavigationBar';
import Home from './pages/MainPage';
import LoginPage from './pages/LoginPage/LoginPage';
import DreamDetail from './pages/DreamDetailPage';
import DreamRecord from './pages/DreamRegisterPage';
import Settings from './pages/SettingPage';

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
          <div className="flex w-full max-w-[600px] flex-col bg-white shadow-lg">
            <main className="flex-grow overflow-auto">
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/dream/:id" element={<DreamDetail />} />
                <Route path="/record" element={<DreamRecord />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/login"
                  element={<LoginPage isLoggedIn={isLoggedIn} toggleLoginStatus={toggleLoginStatus} />}
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

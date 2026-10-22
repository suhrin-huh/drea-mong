import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const ErrorPage = lazy(() => import('@/pages/error').then((module) => ({ default: module.ErrorPage })));
const HomePage = lazy(() => import('@/pages/home').then((module) => ({ default: module.HomePage })));
const LoginPage = lazy(() => import('@/pages/login').then((module) => ({ default: module.LoginPage })));
const AuthCallbackPage = lazy(() =>
  import('@/pages/auth-callback').then((module) => ({ default: module.AuthCallbackPage })),
);
const DreamCreatePage = lazy(() => import('@/pages/dream').then((module) => ({ default: module.DreamCreatePage })));
const DreamEditPage = lazy(() => import('@/pages/dream').then((module) => ({ default: module.DreamEditPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((module) => ({ default: module.SettingsPage })));
const StreamingLayout = lazy(() => import('@/pages/streaming').then((module) => ({ default: module.StreamingLayout })));
const StreamingListPage = lazy(() =>
  import('@/pages/streaming').then((module) => ({ default: module.StreamingListPage })),
);
const StreamingRoomPage = lazy(() =>
  import('@/pages/streaming').then((module) => ({ default: module.StreamingRoomPage })),
);
const SquarePage = lazy(() => import('@/pages/square').then((module) => ({ default: module.SquarePage })));
const SquareDetailPage = lazy(() => import('@/pages/square').then((module) => ({ default: module.SquareDetailPage })));
const StatisticsPage = lazy(() => import('@/pages/statistics').then((module) => ({ default: module.StatisticsPage })));

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dream/create" element={<DreamCreatePage />} />
      <Route path="/dream/:dreamId" element={<DreamEditPage />} />
      <Route path="/square/dreams" element={<SquarePage />} />
      <Route path="/square/:dreamId" element={<SquareDetailPage />} />
      <Route path="/streaming" element={<StreamingLayout />}>
        <Route index element={<StreamingListPage />} />
        <Route path=":roomId" element={<StreamingRoomPage />} />
      </Route>
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<ErrorPage />} />
      <Route path="/error" element={<ErrorPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;

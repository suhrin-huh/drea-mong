import AppProviders from './providers/AppProviders';
import AppRoutes from './routes/AppRoutes';
import AppLayout from './ui/AppLayout';

const App = () => (
  <AppProviders>
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </AppProviders>
);

export default App;

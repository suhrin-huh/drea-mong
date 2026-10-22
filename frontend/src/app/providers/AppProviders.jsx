import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';

const AppProviders = ({ children }) => (
  <RecoilRoot>
    <BrowserRouter>{children}</BrowserRouter>
  </RecoilRoot>
);

export default AppProviders;

import React from 'react';
import { AuthProvider } from './contexts/SimpleAuthContext';
import MainPage from './pages/MainPage';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
};

export default App;
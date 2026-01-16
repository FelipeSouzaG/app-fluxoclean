
import React from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteRegistration from './pages/CompleteRegistration';
import SuperAdmin from './pages/SuperAdmin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contract from './pages/Contract';

const App: React.FC = () => {
  const path = window.location.pathname;

  if (path === '/login') return <Login />;
  if (path === '/register') return <Register />;
  if (path === '/complete-registration') return <CompleteRegistration />;
  if (path === '/forgot-password') return <ForgotPassword />;
  if (path === '/superadmin') return <SuperAdmin />;
  if (path === '/contract') return <Contract />; // Public Legal Page
  if (path.startsWith('/reset-password/')) return <ResetPassword />;

  // Default / Fallback to Landing Page
  return <LandingPage />;
};

export default App;

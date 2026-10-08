import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import SignInPage from './components/Auth/SignInPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Dedicated Admin Dashboard URL */}
        <Route
          path="/admin"
          element={<AdminDashboard onBackToStore={() => { window.location.href = '/'; }} />}
        />
        {/* Dedicated Customer Sign In URL */}
        <Route
          path="/signin"
          element={
            <SignInPage
              onNavigateHome={() => { window.location.href = '/'; }}
              onLoginSuccess={(name) => {
                localStorage.setItem('atomy_member', name);
                window.location.href = '/';
              }}
            />
          }
        />
        {/* Customer Storefront (All other paths) */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
